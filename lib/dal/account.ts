import { asc, eq, like } from "drizzle-orm"
import { account, category, link, session, user, verification } from "@/db/schema"
import type { Db } from "@/lib/dal/types"
import { withUser } from "@/lib/dal/with-user"

/** Todo lo que índice guarda de una persona, en un formato legible (RGPD: acceso y portabilidad). */
export async function exportAccount(db: Db, userId: string) {
  if (!userId) throw new Error("Falta el usuario.")
  const [profile] = await db
    .select({
      name: user.name,
      email: user.email,
      city: user.city,
      cityCountry: user.cityCountry,
      cityLat: user.cityLat,
      cityLng: user.cityLng,
      createdAt: user.createdAt,
      onboardedAt: user.onboardedAt,
      termsAcceptedAt: user.termsAcceptedAt,
    })
    .from(user)
    .where(eq(user.id, userId))
  if (!profile) throw new Error("No se encontró el usuario.")

  const logins = await db
    .select({ provider: account.providerId, createdAt: account.createdAt })
    .from(account)
    .where(eq(account.userId, userId))

  const { categories, links } = await withUser(db, userId, async (tx) => ({
    categories: await tx
      .select({ id: category.id, name: category.name, position: category.position, createdAt: category.createdAt })
      .from(category)
      .where(eq(category.userId, userId))
      .orderBy(asc(category.position)),
    links: await tx
      .select({
        url: link.url,
        name: link.name,
        title: link.title,
        categoryId: link.categoryId,
        tags: link.tags,
        pinned: link.pinned,
        createdAt: link.createdAt,
      })
      .from(link)
      .where(eq(link.userId, userId))
      .orderBy(asc(link.createdAt)),
  }))

  const categoryName = new Map(categories.map((c) => [c.id, c.name]))
  return {
    exportedAt: new Date().toISOString(),
    profile,
    logins,
    categories: categories.map(({ name, position, createdAt }) => ({ name, position, createdAt })),
    links: links.map(({ categoryId, ...rest }) => ({ ...rest, category: categoryId ? (categoryName.get(categoryId) ?? null) : null })),
  }
}

/**
 * Borra la cuenta y todo lo asociado (RGPD: supresión). Enlaces y categorías se borran
 * dentro de withUser (RLS); sesiones y cuentas OAuth caen en cascada con el usuario.
 * Los códigos de acceso pendientes de su correo también se borran.
 */
export async function deleteAccount(db: Db, userId: string) {
  if (!userId) throw new Error("Falta el usuario.")
  await withUser(db, userId, async (tx) => {
    const [row] = await tx.select({ email: user.email }).from(user).where(eq(user.id, userId))
    if (!row) throw new Error("No se encontró el usuario.")
    await tx.delete(link).where(eq(link.userId, userId))
    await tx.delete(category).where(eq(category.userId, userId))
    await tx.delete(session).where(eq(session.userId, userId))
    await tx.delete(account).where(eq(account.userId, userId))
    await tx.delete(verification).where(like(verification.identifier, `%-otp-${row.email.replace(/[\\%_]/g, "\\$&")}`))
    await tx.delete(user).where(eq(user.id, userId))
  })
}
