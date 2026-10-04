import { eq } from "drizzle-orm"
import { z } from "zod"
import { category, link } from "@/db/schema"
import { classifyLink } from "@/lib/classify"
import { categoryName, slugify } from "@/lib/dal/categories"
import { ensureCategories } from "@/lib/dal/reorganize"
import type { Db } from "@/lib/dal/types"
import { withUser } from "@/lib/dal/with-user"
import { MAX_BOOKMARKS } from "@/lib/import/bookmarks-html"
import { httpUrl, normalizeUrl } from "@/lib/validation"

const MIN_DATE = Date.UTC(1995, 0, 1)

export const importItems = z
  .array(
    z.object({
      url: z.string(),
      name: z.string(),
      folders: z.array(z.string()).max(20),
      addedAt: z.number().nullable(),
    })
  )
  .max(MAX_BOOKMARKS, `Como máximo ${MAX_BOOKMARKS} enlaces por importación.`)

export type ImportItem = z.infer<typeof importItems>[number]
export type ImportSummary = { added: number; duplicates: number; invalid: number; categories: number }

type Prepared = { url: string; normalizedUrl: string; name: string; category: string | null; tags: string[]; createdAt: Date }

/**
 * Valida cada entrada. La categoría sale de lo que es el enlace (clasificación por reglas);
 * si no hay pistas, se usa la carpeta de primer nivel. Las carpetas se guardan como tags.
 */
function prepare(items: ImportItem[], now: number, ownerName?: string | null): { valid: Prepared[]; invalid: number } {
  const valid: Prepared[] = []
  let invalid = 0
  for (const item of items) {
    const url = httpUrl.safeParse(item.url)
    const name = item.name.trim().slice(0, 200)
    if (!url.success || !name) {
      invalid++
      continue
    }
    const folder = item.folders[0] ? categoryName.safeParse(item.folders[0]) : null
    const classified = classifyLink({ url: url.data, title: name, ownerName })
    const tags = [...new Set(item.folders.map((f) => f.trim().toLowerCase().slice(0, 40)).filter(Boolean))].slice(0, 10)
    const when = item.addedAt && item.addedAt >= MIN_DATE && item.addedAt <= now ? item.addedAt : now
    valid.push({
      url: url.data,
      normalizedUrl: normalizeUrl(url.data),
      name,
      category: classified?.category ?? (folder?.success ? folder.data : null),
      tags,
      createdAt: new Date(when),
    })
  }
  return { valid, invalid }
}

/**
 * Importa marcadores a la cuenta del usuario en una sola transacción.
 * Las URLs que ya tenía (o repetidas en el archivo) se saltan.
 */
export async function importBookmarks(
  db: Db,
  userId: string,
  rawItems: unknown,
  now = Date.now(),
  ownerName?: string | null
): Promise<ImportSummary> {
  const items = importItems.parse(rawItems)
  const { valid, invalid } = prepare(items, now, ownerName)

  // Repetidas dentro del propio archivo: se queda la primera.
  const seen = new Set<string>()
  const unique = valid.filter((v) => (seen.has(v.normalizedUrl) ? false : (seen.add(v.normalizedUrl), true)))

  return withUser(db, userId, async (tx) => {
    const before = new Set((await tx.select({ id: category.id }).from(category).where(eq(category.userId, userId))).map((c) => c.id))
    const ids = await ensureCategories(
      tx,
      userId,
      unique.flatMap((u) => (u.category ? [u.category] : []))
    )
    const idBySlug = new Map([...ids].map(([name, id]) => [slugify(name), id]))
    const createdCategories = new Set([...ids.values()].filter((id) => !before.has(id))).size

    let added = 0
    for (let i = 0; i < unique.length; i += 500) {
      const chunk = unique.slice(i, i + 500)
      const rows = await tx
        .insert(link)
        .values(
          chunk.map((u) => ({
            id: crypto.randomUUID(),
            userId,
            url: u.url,
            normalizedUrl: u.normalizedUrl,
            name: u.name,
            categoryId: u.category ? (idBySlug.get(slugify(u.category)) ?? null) : null,
            tags: u.tags,
            createdAt: u.createdAt,
          }))
        )
        .onConflictDoNothing({ target: [link.userId, link.normalizedUrl] })
        .returning({ id: link.id })
      added += rows.length
    }

    return { added, duplicates: valid.length - added, invalid, categories: createdCategories }
  })
}
