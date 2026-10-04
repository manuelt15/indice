import { and, eq, sql } from "drizzle-orm"
import { category, link } from "@/db/schema"
import { slugify } from "@/lib/dal/categories"
import type { Db, Tx } from "@/lib/dal/types"
import { withUser } from "@/lib/dal/with-user"
import { classifyLink, DEFAULT_CATEGORIES } from "@/lib/classify"

/** Devuelve el id de cada categoría por nombre, creándolas si faltan (dentro de la transacción). */
export async function ensureCategories(tx: Tx, userId: string, names: string[]): Promise<Map<string, string>> {
  const ids = new Map<string, string>()
  const existing = await tx.select().from(category).where(eq(category.userId, userId))
  const bySlug = new Map(existing.map((c) => [c.slug, c.id]))
  for (const name of [...new Set(names)]) {
    const slug = slugify(name)
    let id = bySlug.get(slug)
    if (!id) {
      const position = DEFAULT_CATEGORIES.indexOf(name as (typeof DEFAULT_CATEGORIES)[number])
      const [row] = await tx
        .insert(category)
        .values({ id: crypto.randomUUID(), userId, name, slug, position: position >= 0 ? position : 100 })
        .returning({ id: category.id })
      id = row.id
      bySlug.set(slug, id)
    }
    ids.set(name, id)
  }
  return ids
}

export type ReorganizeSummary = { moved: number; unchanged: number; unclassified: number; removedCategories: number }

/**
 * Reclasifica todos los enlaces del usuario por reglas. Si un enlace sale de una categoría
 * propia (por ejemplo, una carpeta importada), esa categoría se guarda como tag para no perderla.
 * Al final se borran las categorías que se han quedado vacías.
 */
export async function reorganizeLinks(db: Db, userId: string, ownerName?: string | null): Promise<ReorganizeSummary> {
  return withUser(db, userId, async (tx) => {
    const links = await tx.select().from(link).where(eq(link.userId, userId))
    const cats = await tx.select().from(category).where(eq(category.userId, userId))
    const nameById = new Map(cats.map((c) => [c.id, c.name]))

    const plan = links.map((l) => ({ l, result: classifyLink({ url: l.url, title: l.name, ownerName }) }))
    const ids = await ensureCategories(
      tx,
      userId,
      plan.flatMap((p) => (p.result ? [p.result.category] : []))
    )

    let moved = 0
    let unchanged = 0
    let unclassified = 0
    for (const { l, result } of plan) {
      if (!result) {
        unclassified++
        continue
      }
      const target = ids.get(result.category)!
      if (target === l.categoryId) {
        unchanged++
        continue
      }
      const previous = l.categoryId ? nameById.get(l.categoryId) : null
      const keepAsTag = previous && !(DEFAULT_CATEGORIES as readonly string[]).includes(previous) ? previous.toLowerCase().slice(0, 40) : null
      const tags = keepAsTag && !l.tags.includes(keepAsTag) ? [...l.tags, keepAsTag].slice(0, 10) : l.tags
      await tx
        .update(link)
        .set({ categoryId: target, tags })
        .where(and(eq(link.id, l.id), eq(link.userId, userId)))
      moved++
    }

    const removed = await tx
      .delete(category)
      .where(
        and(
          eq(category.userId, userId),
          sql`not exists (select 1 from ${link} where ${link.categoryId} = ${category.id} and ${link.userId} = ${userId})`
        )
      )
      .returning({ id: category.id })

    return { moved, unchanged, unclassified, removedCategories: removed.length }
  })
}
