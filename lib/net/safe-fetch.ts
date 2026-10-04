import "server-only"
import { lookup as dnsLookup, type LookupAddress, type LookupOptions } from "node:dns"
import http from "node:http"
import https from "node:https"
import { isIP } from "node:net"
import { isNonPublicIp } from "@/lib/net/ip"

export class BlockedUrlError extends Error {
  constructor(reason: string) {
    super(`URL bloqueada: ${reason}`)
    this.name = "BlockedUrlError"
  }
}

type LookupFn = typeof dnsLookup

export type SafeFetchOptions = {
  maxBytes?: number
  timeoutMs?: number
  maxRedirects?: number
  accept?: string
  /** Si la respuesta supera maxBytes, se queda con los primeros bytes en vez de fallar (útil para leer el <head>). */
  truncate?: boolean
  /** Solo para tests: sustituye la resolución DNS. */
  lookupImpl?: LookupFn
}

export type SafeResponse = {
  status: number
  contentType: string
  body: Buffer
  finalUrl: string
}

const ALLOWED_PORTS = new Set(["", "80", "443"])

function assertAllowedUrl(url: URL) {
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new BlockedUrlError("protocolo no permitido")
  if (url.username || url.password) throw new BlockedUrlError("credenciales en la URL")
  if (!ALLOWED_PORTS.has(url.port)) throw new BlockedUrlError("puerto no permitido")
  const host = url.hostname.replace(/^\[|\]$/g, "")
  // Node no consulta el DNS para IPs literales: se comprueban aquí.
  if (isIP(host) && isNonPublicIp(host)) throw new BlockedUrlError("dirección interna")
}

/**
 * Resolución DNS que rechaza direcciones internas. Se usa en la propia conexión,
 * así que valida la IP real a la que se conecta (protege también frente a DNS rebinding).
 */
function guardedLookup(lookupImpl: LookupFn) {
  return (hostname: string, options: LookupOptions, callback: (...args: unknown[]) => void) => {
    lookupImpl(hostname, { ...options, all: true }, (error, addresses) => {
      if (error) return callback(error)
      const list = (Array.isArray(addresses) ? addresses : []) as LookupAddress[]
      if (list.length === 0 || list.some((a) => isNonPublicIp(a.address))) {
        return callback(new BlockedUrlError("dirección interna"))
      }
      if (options.all) return callback(null, list)
      return callback(null, list[0].address, list[0].family)
    })
  }
}

function requestOnce(url: URL, options: Required<Omit<SafeFetchOptions, "lookupImpl">> & { lookupImpl: LookupFn }) {
  return new Promise<{ status: number; location?: string; contentType: string; body: Buffer }>((resolve, reject) => {
    const client = url.protocol === "https:" ? https : http
    const req = client.request(
      url,
      {
        method: "GET",
        lookup: guardedLookup(options.lookupImpl) as never,
        headers: {
          "User-Agent": "indice/1.0 (+https://github.com/manuelt15/indice)",
          Accept: options.accept,
          "Accept-Encoding": "identity",
        },
        timeout: options.timeoutMs,
      },
      (res) => {
        const status = res.statusCode ?? 0
        const contentType = String(res.headers["content-type"] ?? "")
        if (status >= 300 && status < 400) {
          res.resume()
          return resolve({ status, location: res.headers.location, contentType, body: Buffer.alloc(0) })
        }
        const declared = Number(res.headers["content-length"] ?? 0)
        if (declared > options.maxBytes && !options.truncate) {
          req.destroy()
          return reject(new Error("Respuesta demasiado grande."))
        }
        const chunks: Buffer[] = []
        let size = 0
        res.on("data", (chunk: Buffer) => {
          if (size + chunk.length > options.maxBytes) {
            if (options.truncate) {
              chunks.push(chunk.subarray(0, options.maxBytes - size))
              size = options.maxBytes
              res.destroy()
              return resolve({ status, contentType, body: Buffer.concat(chunks) })
            }
            req.destroy(new Error("Respuesta demasiado grande."))
            return
          }
          size += chunk.length
          chunks.push(chunk)
        })
        res.on("end", () => resolve({ status, contentType, body: Buffer.concat(chunks) }))
        res.on("error", reject)
      }
    )
    req.on("timeout", () => req.destroy(new Error("Tiempo de espera agotado.")))
    req.on("error", reject)
    req.end()
  })
}

/**
 * GET seguro a una URL que viene del usuario. Solo http(s) en los puertos 80/443,
 * nunca a direcciones internas (ni en redirecciones), con límite de tiempo y de tamaño.
 */
export async function safeFetch(input: string, opts: SafeFetchOptions = {}): Promise<SafeResponse> {
  const options = {
    maxBytes: opts.maxBytes ?? 512 * 1024,
    timeoutMs: opts.timeoutMs ?? 4000,
    maxRedirects: opts.maxRedirects ?? 3,
    accept: opts.accept ?? "*/*",
    truncate: opts.truncate ?? false,
    lookupImpl: opts.lookupImpl ?? dnsLookup,
  }
  let url = new URL(input)
  for (let hop = 0; hop <= options.maxRedirects; hop++) {
    assertAllowedUrl(url)
    const res = await requestOnce(url, options)
    if (res.status >= 300 && res.status < 400 && res.location) {
      url = new URL(res.location, url)
      continue
    }
    return { status: res.status, contentType: res.contentType, body: res.body, finalUrl: url.toString() }
  }
  throw new Error("Demasiadas redirecciones.")
}
