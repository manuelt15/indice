import { describe, expect, it } from "vitest"
import { httpUrl, newLinkInput, normalizeUrl } from "@/lib/validation"

describe("httpUrl", () => {
  it("acepta http y https", () => {
    expect(httpUrl.safeParse("https://ui.shadcn.com").success).toBe(true)
    expect(httpUrl.safeParse("http://example.com/a?b=1").success).toBe(true)
  })

  it.each([
    "javascript:alert(1)",
    "JAVASCRIPT:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "file:///etc/passwd",
    "vbscript:msgbox(1)",
    "ftp://example.com",
    "no es una url",
    "",
  ])("rechaza %s", (value) => {
    expect(httpUrl.safeParse(value).success).toBe(false)
  })
})

describe("normalizeUrl", () => {
  it("quita fragmento, rastreo y barra final, y ordena parámetros", () => {
    expect(normalizeUrl("https://Example.com/docs/?utm_source=x&b=2&a=1#intro")).toBe(
      "https://example.com/docs?a=1&b=2"
    )
  })

  it("trata como iguales variantes de la misma URL", () => {
    expect(normalizeUrl("https://example.com/")).toBe(normalizeUrl("https://example.com"))
  })
})

describe("newLinkInput", () => {
  it("limpia y deduplica tags", () => {
    const parsed = newLinkInput.parse({ url: "https://a.com", name: " A ", tags: ["React", "react", " UI "] })
    expect(parsed.name).toBe("A")
    expect(parsed.tags).toEqual(["react", "ui"])
  })
})
