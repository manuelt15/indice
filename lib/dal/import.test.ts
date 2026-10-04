import { readFileSync } from "node:fs"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { categoriesRepo } from "@/lib/dal/categories"
import { importBookmarks } from "@/lib/dal/import"
import { linksRepo } from "@/lib/dal/links"
import type { Db } from "@/lib/dal/types"
import { MAX_BOOKMARKS, parseBookmarksHtml } from "@/lib/import/bookmarks-html"
import { createTestDb, createUser } from "@/test/db"

let db: Db
let close: () => Promise<void>
const NOW = Date.UTC(2026, 9, 4)

beforeAll(async () => {
  const test = await createTestDb()
  db = test.db
  close = () => test.client.close()
  await createUser(db, "a")
  await createUser(db, "b")
})

afterAll(async () => close())

const parsed = parseBookmarksHtml(readFileSync("test/fixtures/chrome-bookmarks.html", "utf8"))

describe("importar marcadores", () => {
  it("importa, crea categorías de primer nivel y usa subcarpetas como tags", async () => {
    const summary = await importBookmarks(db, "a", parsed.bookmarks, NOW)
    expect(summary).toEqual({ added: 4, duplicates: 1, invalid: 0, categories: 1 })

    const links = await linksRepo(db).list("a")
    const cats = await categoriesRepo(db).list("a")
    expect(cats.map((c) => c.name)).toEqual(["Diseño & UI"])
    const bits = links.find((l) => l.url.includes("reactbits"))!
    expect(bits.categoryId).toBe(cats[0].id)
    expect(bits.tags).toEqual(["animaciones"])
  })

  it("conserva la fecha original del marcador", async () => {
    const gh = (await linksRepo(db).list("a")).find((l) => l.url.startsWith("https://github.com"))!
    expect(gh.createdAt.getTime()).toBe(1737407066000)
  })

  it("al reimportar no duplica nada", async () => {
    const again = await importBookmarks(db, "a", parsed.bookmarks, NOW)
    expect(again.added).toBe(0)
    expect((await linksRepo(db).list("a")).length).toBe(4)
  })

  it("importa en la cuenta de quien importa y no toca la de otros", async () => {
    await importBookmarks(db, "b", parsed.bookmarks.slice(0, 1), NOW)
    expect((await linksRepo(db).list("b")).length).toBe(1)
    expect((await linksRepo(db).list("a")).length).toBe(4)
  })

  it("rechaza entradas no http(s) aunque lleguen por la API sin pasar por el lector", async () => {
    const summary = await importBookmarks(
      db,
      "b",
      [
        { url: "javascript:alert(1)", name: "x", folders: [], addedAt: null },
        { url: "https://ok.com", name: "", folders: [], addedAt: null },
        { url: "https://futuro.com", name: "Futuro", folders: [], addedAt: NOW + 10 ** 12 },
      ],
      NOW
    )
    expect(summary).toMatchObject({ added: 1, invalid: 2 })
    const futuro = (await linksRepo(db).list("b")).find((l) => l.url.includes("futuro"))!
    expect(futuro.createdAt.getTime()).toBe(NOW)
  })

  it("limita el tamaño de una importación", async () => {
    const many = Array.from({ length: MAX_BOOKMARKS + 1 }, (_, i) => ({ url: `https://x${i}.com`, name: "x", folders: [], addedAt: null }))
    await expect(importBookmarks(db, "a", many, NOW)).rejects.toThrow()
  })
})
