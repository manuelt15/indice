import { sql } from "drizzle-orm"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import * as schema from "@/db/schema"
import { deleteAccount, exportAccount } from "@/lib/dal/account"
import { categoriesRepo } from "@/lib/dal/categories"
import { linksRepo } from "@/lib/dal/links"
import type { Db } from "@/lib/dal/types"
import { withUser } from "@/lib/dal/with-user"
import { createTestDb, createUser } from "@/test/db"

let db: Db
let close: () => Promise<void>

async function seed(id: string) {
  await createUser(db, id)
  const later = new Date(Date.now() + 60_000)
  await db.insert(schema.session).values({ id: `s-${id}`, token: `t-${id}`, userId: id, expiresAt: later })
  await db.insert(schema.account).values({ id: `a-${id}`, accountId: `gh-${id}`, providerId: "github", userId: id })
  await db.insert(schema.verification).values({ id: `v-${id}`, identifier: `sign-in-otp-${id}@example.com`, value: "hash", expiresAt: later })
  const cat = await categoriesRepo(db).ensure(id, "Diseño")
  await linksRepo(db).create(id, { url: `https://${id}.example.com/`, name: `Web de ${id}`, categoryId: cat.id, tags: ["uno"] })
}

beforeAll(async () => {
  const test = await createTestDb()
  db = test.db
  close = () => test.client.close()
  await seed("ana")
  await seed("beto")
})

afterAll(async () => close())

describe("exportar datos", () => {
  it("incluye perfil, accesos, categorías y enlaces del propio usuario, y nada de otro", async () => {
    const data = await exportAccount(db, "ana")
    expect(data.profile.email).toBe("ana@example.com")
    expect(data.logins).toEqual([{ provider: "github", createdAt: expect.any(Date) }])
    expect(data.categories.map((c) => c.name)).toEqual(["Diseño"])
    expect(data.links).toHaveLength(1)
    expect(data.links[0]).toMatchObject({ url: "https://ana.example.com/", category: "Diseño", tags: ["uno"] })
    expect(JSON.stringify(data)).not.toContain("beto")
  })
})

describe("borrar la cuenta", () => {
  it("no deja ninguna fila de la persona en ninguna tabla y no toca a nadie más", async () => {
    await deleteAccount(db, "ana")

    const ana = await withUser(db, "ana", async (tx) => ({
      links: (await tx.select().from(schema.link)).length,
      categories: (await tx.select().from(schema.category)).length,
    }))
    expect(ana).toEqual({ links: 0, categories: 0 })
    const left = await db.execute(sql`
      select
        (select count(*)::int from "user" where id = 'ana') as "user",
        (select count(*)::int from session where user_id = 'ana') as session,
        (select count(*)::int from account where user_id = 'ana') as account,
        (select count(*)::int from verification where identifier like '%ana@example.com') as verification`)
    expect((left as { rows: unknown[] }).rows[0]).toEqual({ user: 0, session: 0, account: 0, verification: 0 })

    expect(await linksRepo(db).list("beto")).toHaveLength(1)
    expect(await categoriesRepo(db).list("beto")).toHaveLength(1)
    const beto = await db.execute(sql`
      select
        (select count(*)::int from "user" where id = 'beto') as "user",
        (select count(*)::int from session where user_id = 'beto') as session,
        (select count(*)::int from account where user_id = 'beto') as account,
        (select count(*)::int from verification where identifier like '%beto@example.com') as verification`)
    expect((beto as { rows: unknown[] }).rows[0]).toEqual({ user: 1, session: 1, account: 1, verification: 1 })
  })

  it("falla si el usuario no existe", async () => {
    await expect(deleteAccount(db, "nadie")).rejects.toThrow()
    await expect(deleteAccount(db, "")).rejects.toThrow()
  })
})
