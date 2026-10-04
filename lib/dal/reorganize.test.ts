import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { categoriesRepo } from "@/lib/dal/categories"
import { linksRepo } from "@/lib/dal/links"
import { reorganizeLinks } from "@/lib/dal/reorganize"
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

describe("reorganizar", () => {
  it("clasifica, guarda la carpeta antigua como tag y borra categorías vacías", async () => {
    const folder = await categoriesRepo(db).ensure("a", "librerias-recursos")
    await linksRepo(db).create("a", { url: "https://ui.shadcn.com", name: "shadcn/ui", categoryId: folder.id })
    await linksRepo(db).create("a", { url: "https://ollama.com", name: "Ollama" })
    await linksRepo(db).create("a", { url: "https://example.org", name: "Algo sin pistas" })

    const summary = await reorganizeLinks(db, "a")
    expect(summary).toEqual({ moved: 2, unchanged: 0, unclassified: 1, removedCategories: 1 })

    const cats = new Map((await categoriesRepo(db).list("a")).map((c) => [c.id, c.name]))
    const links = await linksRepo(db).list("a")
    const shadcn = links.find((l) => l.url.includes("shadcn"))!
    expect(cats.get(shadcn.categoryId!)).toBe("UI")
    expect(shadcn.tags).toContain("librerias-recursos")
    expect([...cats.values()].sort()).toEqual(["IA", "UI"])
  })

  it("es idempotente", async () => {
    expect(await reorganizeLinks(db, "a")).toMatchObject({ moved: 0, unchanged: 2 })
  })

  it("solo toca los enlaces del usuario que reorganiza", async () => {
    await linksRepo(db).create("b", { url: "https://uiverse.io", name: "Uiverse" })
    await reorganizeLinks(db, "a")
    const [b] = await linksRepo(db).list("b")
    expect(b.categoryId).toBeNull()
    expect(await categoriesRepo(db).list("b")).toEqual([])
  })
})
