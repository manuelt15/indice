import { createServer, type Server } from "node:http"
import type { AddressInfo } from "node:net"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
const { BlockedUrlError, safeFetch } = await import("@/lib/net/safe-fetch")

let server: Server
let port = 0

beforeAll(async () => {
  server = createServer((_, res) => res.end("secreto interno"))
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r))
  port = (server.address() as AddressInfo).port
})

afterAll(() => new Promise<void>((r) => server.close(() => r())))

describe("safeFetch (protección SSRF)", () => {
  it.each([
    "http://127.0.0.1/",
    "http://localhost/",
    "http://169.254.169.254/latest/meta-data/",
    "http://[::1]/",
    "http://2130706433/",
    "http://0x7f.0.0.1/",
    "http://10.0.0.5/",
    "http://192.168.1.1/admin",
  ])("bloquea %s", async (url) => {
    await expect(safeFetch(url)).rejects.toThrow()
  })

  it("bloquea puertos que no son 80/443 (aunque el servidor exista)", async () => {
    await expect(safeFetch(`http://127.0.0.1:${port}/`)).rejects.toBeInstanceOf(BlockedUrlError)
  })

  it.each(["file:///etc/passwd", "ftp://example.com/", "gopher://example.com/", "http://user:pass@example.com/"])(
    "bloquea %s",
    async (url) => {
      await expect(safeFetch(url)).rejects.toBeInstanceOf(BlockedUrlError)
    }
  )

  it("bloquea un dominio público que resuelve a una IP interna (DNS rebinding)", async () => {
    const fakeDns = ((_host: string, _opts: unknown, cb: (e: null, a: { address: string; family: number }[]) => void) =>
      cb(null, [{ address: "127.0.0.1", family: 4 }])) as never
    await expect(safeFetch("http://parece-publico.com/", { lookupImpl: fakeDns })).rejects.toBeInstanceOf(BlockedUrlError)
  })

  it("bloquea si alguna de las IPs resueltas es interna", async () => {
    const fakeDns = ((_host: string, _opts: unknown, cb: (e: null, a: { address: string; family: number }[]) => void) =>
      cb(null, [
        { address: "93.184.216.34", family: 4 },
        { address: "10.0.0.1", family: 4 },
      ])) as never
    await expect(safeFetch("http://mixto.com/", { lookupImpl: fakeDns })).rejects.toBeInstanceOf(BlockedUrlError)
  })
})
