import { describe, expect, it } from "vitest"
import { sniffIconType } from "@/lib/net/image"
import { extractIconUrls, extractTitle } from "@/lib/net/page-meta"

describe("extractTitle", () => {
  it("prefiere og:title y decodifica entidades", () => {
    const html = `<head><title>X</title><meta property="og:title" content="Caf&eacute; &amp; T&#233;"></head>`
    expect(extractTitle(html)).toBe("Caf&eacute; & Té")
  })

  it("usa <title> y limpia espacios", () => {
    expect(extractTitle("<title>\n  shadcn/ui   docs </title>")).toBe("shadcn/ui docs")
  })

  it("devuelve null sin título", () => {
    expect(extractTitle("<p>hola</p>")).toBeNull()
  })
})

describe("extractIconUrls", () => {
  it("resuelve rutas relativas y descarta protocolos raros", () => {
    const html = `<link rel="icon" href="/favicon-32.png"><link rel="shortcut icon" href='//cdn.example.com/f.ico'><link rel="icon" href="javascript:alert(1)"><link rel="stylesheet" href="/a.css">`
    expect(extractIconUrls(html, "https://example.com/docs/")).toEqual([
      "https://example.com/favicon-32.png",
      "https://cdn.example.com/f.ico",
    ])
  })
})

describe("sniffIconType", () => {
  it("reconoce PNG e ICO por sus bytes", () => {
    expect(sniffIconType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 0]))).toBe("image/png")
    expect(sniffIconType(new Uint8Array([0, 0, 1, 0, 1, 0]))).toBe("image/x-icon")
  })

  it("reconoce SVG (se sirve con CSP sandbox) y rechaza HTML aunque diga ser imagen", () => {
    expect(sniffIconType(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>'))).toBe("image/svg+xml")
    expect(sniffIconType(new TextEncoder().encode('<?xml version="1.0"?>\n<svg></svg>'))).toBe("image/svg+xml")
    expect(sniffIconType(new TextEncoder().encode("<!doctype html><svg></svg>"))).toBeNull()
    expect(sniffIconType(new TextEncoder().encode("<html><body>hola</body></html>"))).toBeNull()
  })
})
