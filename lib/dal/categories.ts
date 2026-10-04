import { and, asc, eq, sql } from "drizzle-orm"
import { z } from "zod"
import { category, link } from "@/db/schema"
import type { Db } from "@/lib/dal/types"
import { withUser } from "@/lib/dal/with-user"

export type Category = typeof category.$inferSelect
export type CategoryWithCount = Category & { count: number }

export const categoryName = z
  .string()
  .trim()
  .min(1, "Ponle nombre a la categoría.")
  .max(40, "Como máximo 40 caracteres.")
  .refine((v) => !/[\u0000-\u001f\u007f<>]/.test(v), "El nombre tiene caracteres no permitidos.")

/** "Diseño y UI" → "diseno-y-ui". */
export function slugify(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9ñ]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "categoria"
  )
}

export function categoriesRepo(db: Db) {
  return {
    list(userId: string): Promise<CategoryWithCount[]> {
      return withUser(db, userId, (tx) =>
        tx
          .select({
            id: category.id,
            userId: category.userId,
            name: category.name,
            slug: category.slug,
            position: category.position,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
            count: sql<number>`count(${link.id})::int`,
          })
          .from(category)
          .leftJoin(link, and(eq(link.categoryId, category.id), eq(link.userId, userId)))
          .where(eq(category.userId, userId))
          .groupBy(category.id)
          .orderBy(asc(category.position), asc(category.name))
      )
    },

    /** Crea la categoría o devuelve la existente con el mismo nombre (sin distinguir tildes ni mayúsculas). */
    async ensure(userId: string, rawName: string): Promise<Category> {
      const name = categoryName.parse(rawName)
      const slug = slugify(name)
      return withUser(db, userId, async (tx) => {
        const existing = await tx
          .select()
          .from(category)
          .where(and(eq(category.userId, userId), eq(category.slug, slug)))
          .limit(1)
        if (existing[0]) return existing[0]
        const [row] = await tx.insert(category).values({ id: crypto.randomUUID(), userId, name, slug }).returning()
        return row
      })
    },
  }
}
