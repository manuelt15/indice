import { and, desc, eq } from "drizzle-orm"
import { link } from "@/db/schema"
import type { Db } from "@/lib/dal/types"
import { withUser } from "@/lib/dal/with-user"
import { newLinkInput, normalizeUrl, type NewLinkInput } from "@/lib/validation"

export type Link = typeof link.$inferSelect

/**
 * Operaciones sobre enlaces. Primera barrera: cada consulta filtra por userId.
 * Segunda barrera: Row Level Security en Postgres (withUser).
 */
export function linksRepo(db: Db) {
  return {
    list(userId: string): Promise<Link[]> {
      return withUser(db, userId, (tx) =>
        tx.select().from(link).where(eq(link.userId, userId)).orderBy(desc(link.createdAt))
      )
    },

    async get(userId: string, id: string): Promise<Link | null> {
      const rows = await withUser(db, userId, (tx) =>
        tx.select().from(link).where(and(eq(link.id, id), eq(link.userId, userId))).limit(1)
      )
      return rows[0] ?? null
    },

    async create(userId: string, input: NewLinkInput): Promise<Link> {
      const data = newLinkInput.parse(input)
      const [row] = await withUser(db, userId, (tx) =>
        tx
          .insert(link)
          .values({
            id: crypto.randomUUID(),
            userId,
            url: data.url,
            normalizedUrl: normalizeUrl(data.url),
            name: data.name,
            categoryId: data.categoryId ?? null,
            tags: data.tags,
            pinned: data.pinned,
          })
          .returning()
      )
      return row
    },

    /** Fija o quita un enlace. Devuelve false si no existe o no es de este usuario. */
    async setPinned(userId: string, id: string, pinned: boolean): Promise<boolean> {
      const rows = await withUser(db, userId, (tx) =>
        tx
          .update(link)
          .set({ pinned })
          .where(and(eq(link.id, id), eq(link.userId, userId)))
          .returning({ id: link.id })
      )
      return rows.length > 0
    },

    /** Devuelve true si se borró; false si no existe o no es de este usuario. */
    async remove(userId: string, id: string): Promise<boolean> {
      const rows = await withUser(db, userId, (tx) =>
        tx.delete(link).where(and(eq(link.id, id), eq(link.userId, userId))).returning({ id: link.id })
      )
      return rows.length > 0
    },
  }
}
