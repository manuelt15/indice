import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { parseBookmarksHtml } from "@/lib/import/bookmarks-html"

const html = readFileSync("test/fixtures/chrome-bookmarks.html", "utf8")

describe("parseBookmarksHtml (export de Chrome)", () => {
  const { bookmarks, skipped } = parseBookmarksHtml(html)

  it("extrae los enlaces http(s) y descarta bookmarklets y chrome://", () => {
    expect(bookmarks.map((b) => b.url)).toEqual([
      "https://github.com/",
      "https://ui.shadcn.com/",
      "https://reactbits.dev/animations/logo-loop",
      "https://ollama.com/search",
      "https://github.com",
    ])
    expect(skipped).toBe(2)
  })

  it("ignora las carpetas raíz del navegador y conserva las del usuario", () => {
    expect(bookmarks[0].folders).toEqual([])
    expect(bookmarks[1].folders).toEqual(["Diseño & UI"])
    expect(bookmarks[2].folders).toEqual(["Diseño & UI", "Animaciones"])
    expect(bookmarks[3].folders).toEqual([])
  })

  it("decodifica entidades, quita etiquetas y conserva la fecha original", () => {
    expect(bookmarks[2].name).toBe("React Bits – Logo Loop")
    expect(bookmarks[3].name).toBe("Ollama")
    expect(bookmarks[0].addedAt).toBe(1737407066000)
  })

  it("no se rompe con un archivo vacío o que no es de marcadores", () => {
    expect(parseBookmarksHtml("")).toEqual({ bookmarks: [], skipped: 0 })
    expect(parseBookmarksHtml("<html><body>hola</body></html>")).toEqual({ bookmarks: [], skipped: 0 })
  })
})
