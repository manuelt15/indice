import { describe, expect, it } from "vitest"
import { isNonPublicIp } from "@/lib/net/ip"

describe("isNonPublicIp", () => {
  it.each([
    "127.0.0.1",
    "10.1.2.3",
    "172.16.0.1",
    "172.31.255.255",
    "192.168.1.1",
    "169.254.169.254",
    "100.64.0.1",
    "0.0.0.0",
    "224.0.0.1",
    "255.255.255.255",
    "::1",
    "::",
    "fe80::1",
    "fc00::1",
    "fd12:3456::1",
    "::ffff:127.0.0.1",
    "::ffff:169.254.169.254",
    "no-es-una-ip",
  ])("bloquea %s", (ip) => {
    expect(isNonPublicIp(ip)).toBe(true)
  })

  it.each(["8.8.8.8", "1.1.1.1", "172.32.0.1", "2606:4700:4700::1111", "2a00:1450:4003::200e"])("permite %s", (ip) => {
    expect(isNonPublicIp(ip)).toBe(false)
  })
})
