import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
const { parseIconHost } = await import("@/lib/favicons.server")

describe("parseIconHost", () => {
  it("acepta dominios y quita www", () => {
    expect(parseIconHost("WWW.GitHub.com")).toBe("github.com")
    expect(parseIconHost("ui.shadcn.com")).toBe("ui.shadcn.com")
  })

  it.each(["127.0.0.1", "localhost", "169.254.169.254", "example.com:8080", "example.com/x", "-mal.com", "a..b.com", ""])(
    "rechaza %s",
    (value) => {
      expect(parseIconHost(value)).toBeNull()
    }
  )
})
