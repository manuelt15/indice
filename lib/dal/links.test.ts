import { sql } from "drizzle-orm"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { link } from "@/db/schema"
import { linksRepo } from "@/lib/dal/links"
import type { Db } from "@/lib/dal/types"
import { withUser } from "@/lib/dal/with-user"
import { createTestDb, createUser } from "@/test/db"

let db: Db
let close: () => Promise<void>
const A = "user-a"
const B = "user-b"

beforeAll(async () => {
  const test = await createTestDb()
  db = test.db
  close = () => test.client.close()
  await createUser(db, A)
  await createUser(db, B)
})

afterAll(async () => {
  await close()
})

describe("aislamiento entre usuarios (capa de datos)", () => {
  it("B no ve, no lee y no borra los enlaces de A", async () => {
    const repo = linksRepo(db)
    const created = await repo.create(A, { url: "https://privado-de-a.com", name: "Privado de A" })

    expect(await repo.list(B)).toEqual([])
    expect(await repo.get(B, created.id)).toBeNull()
    expect(await repo.remove(B, created.id)).toBe(false)

    expect(await repo.get(A, created.id)).not.toBeNull()
  })

  it("rechaza URLs que no son http(s)", async () => {
    await expect(linksRepo(db).create(A, { url: "javascript:alert(1)", name: "x" })).rejects.toThrow()
  })

  it("no permite duplicar la misma URL en una cuenta, pero sí en cuentas distintas", async () => {
    const repo = linksRepo(db)
    await repo.create(A, { url: "https://repetida.com/", name: "Una" })
    await expect(repo.create(A, { url: "https://repetida.com#x", name: "Otra" })).rejects.toThrow()
    await expect(repo.create(B, { url: "https://repetida.com", name: "De B" })).resolves.toBeTruthy()
  })
})

describe("aislamiento entre usuarios (Row Level Security en Postgres)", () => {
  it("aunque la consulta olvide filtrar por usuario, Postgres solo devuelve las filas propias", async () => {
    const rows = await withUser(db, B, (tx) => tx.select().from(link))
    expect(rows.length).toBeGreaterThan(0)
    expect(rows.every((r) => r.userId === B)).toBe(true)
  })

  it("sin usuario fijado, no se ve ninguna fila", async () => {
    const rows = await db.select().from(link)
    expect(rows).toEqual([])
  })

  it("no deja escribir filas a nombre de otro usuario", async () => {
    await expect(
      withUser(db, B, (tx) =>
        tx.insert(link).values({
          id: "suplantado",
          userId: A,
          url: "https://x.com",
          normalizedUrl: "https://x.com",
          name: "Suplantado",
        })
      )
    ).rejects.toThrow()
  })

  it("el valor de usuario no sobrevive a la transacción", async () => {
    await withUser(db, A, async () => undefined)
    const result = await db.execute(sql`select current_setting('app.user_id', true) as v`)
    const value = (result as unknown as { rows: { v: string | null }[] }).rows[0]?.v
    expect(value ?? "").toBe("")
  })
})
