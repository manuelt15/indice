import { isIP } from "node:net"

/**
 * true si la IP no es pública en internet: loopback, redes privadas, link-local
 * (incluida la de metadatos de la nube, 169.254.169.254), CGNAT, multicast, reservadas…
 * Ante la duda, se considera no pública.
 */
export function isNonPublicIp(address: string): boolean {
  const version = isIP(address)
  if (version === 4) return isNonPublicIPv4(address)
  if (version === 6) return isNonPublicIPv6(address)
  return true
}

function isNonPublicIPv4(address: string): boolean {
  const [a, b, c] = address.split(".").map(Number)
  return (
    a === 0 || // "esta red"
    a === 10 || // privada
    a === 127 || // loopback
    (a === 100 && b >= 64 && b <= 127) || // CGNAT
    (a === 169 && b === 254) || // link-local y metadatos de la nube
    (a === 172 && b >= 16 && b <= 31) || // privada
    (a === 192 && b === 0 && (c === 0 || c === 2)) || // IETF y documentación
    (a === 192 && b === 168) || // privada
    (a === 198 && (b === 18 || b === 19)) || // pruebas de rendimiento
    (a === 198 && b === 51 && c === 100) || // documentación
    (a === 203 && b === 0 && c === 113) || // documentación
    a >= 224 // multicast y reservadas (incluye 255.255.255.255)
  )
}

function isNonPublicIPv6(address: string): boolean {
  const lower = address.toLowerCase()
  // IPv4 incrustada (::ffff:1.2.3.4 y similares): se evalúa la IPv4.
  const embedded = lower.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/)
  if (embedded) return isNonPublicIPv4(embedded[1])
  if (lower === "::" || lower === "::1") return true
  const first = parseInt(lower.split(":")[0] || "0", 16)
  return (
    (first & 0xfe00) === 0xfc00 || // fc00::/7, única local
    (first & 0xffc0) === 0xfe80 || // fe80::/10, link-local
    (first & 0xff00) === 0xff00 || // ff00::/8, multicast
    first === 0x2001 && parseInt(lower.split(":")[1] || "0", 16) === 0x0db8 || // documentación
    first === 0x0064 || // 64:ff9b::/96 traducción NAT64
    first === 0 // resto de ::/8 reservado
  )
}
