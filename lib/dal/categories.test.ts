import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { categoriesRepo, slugify } from "@/lib/dal/categories"
import { linksRepo } from "@/lib/dal/links"
import type { Db } from "@/lib/dal/types"
import { createTestDb, createUser } from "@/test/db"

let db: Db
let close: () => Promise<void>

beforeAll(async () => {
  const test = await createTestDb()
  db = test.db
  close = () => test.client.close()
  await createUser(db, "a")
  await createUser(db, "b")
})

afterAll(async () => close())

describe("categorías", () => {
  it("genera slugs sin tildes", () => {
    expect(slugify("Diseño y UI")).toBe("diseno-y-ui")
  })

  it("no duplica una categoría con el mismo nombre", async () => {
    const repo = categoriesRepo(db)
    const first = await repo.ensure("a", "Diseño")
    const again = await repo.ensure("a", "  diseño ")
    expect(again.id).toBe(first.id)
  })

  it("cuenta enlaces y solo lista las propias", async () => {
    const cat = await categoriesRepo(db).ensure("a", "Dev")
    await linksRepo(db).create("a", { url: "https://nextjs.org", name: "Next.js", categoryId: cat.id })
    const list = await categoriesRepo(db).list("a")
    expect(list.find((c) => c.id === cat.id)?.count).toBe(1)
    expect(await categoriesRepo(db).list("b")).toEqual([])
  })

  it("B no puede colgar su enlace de una categoría de A (FK compuesta)", async () => {
    const ofA = await categoriesRepo(db).ensure("a", "Privada de A")
    await expect(
      linksRepo(db).create("b", { url: "https://intruso.com", name: "Intruso", categoryId: ofA.id })
    ).rejects.toThrow()
  })

  it("al borrar una categoría, sus enlaces quedan sin categoría pero siguen siendo del usuario", async () => {
    const { withUser } = await import("@/lib/dal/with-user")
    const { category } = await import("@/db/schema")
    const { eq } = await import("drizzle-orm")
    const cat = await categoriesRepo(db).ensure("a", "Temporal")
    const created = await linksRepo(db).create("a", { url: "https://temporal.com", name: "Temporal", categoryId: cat.id })
    await withUser(db, "a", (tx) => tx.delete(category).where(eq(category.id, cat.id)))
    const after = await linksRepo(db).get("a", created.id)
    expect(after?.categoryId).toBeNull()
    expect(after?.userId).toBe("a")
  })
})
