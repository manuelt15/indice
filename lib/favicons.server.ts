import "server-only"
import { eq } from "drizzle-orm"
import { isIP } from "node:net"
import { faviconCache } from "@/db/schema"
import type { Db } from "@/lib/dal/types"
import { sniffIconType, type IconType } from "@/lib/net/image"
import { extractIconUrls } from "@/lib/net/page-meta"
import { safeFetch } from "@/lib/net/safe-fetch"

const FRESH_MS = 7 * 24 * 60 * 60 * 1000
const MISSING_RETRY_MS = 24 * 60 * 60 * 1000
const MAX_ICON_BYTES = 100 * 1024

const HOSTNAME = /^(?=.{1,253}$)(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/

/** Dominio válido para pedir su favicon. Nada de IPs, puertos ni rutas. */
export function parseIconHost(value: string): string | null {
  const host = value.trim().toLowerCase().replace(/^www\./, "")
  if (isIP(host)) return null
  return HOSTNAME.test(host) ? host : null
}

export type Favicon = { data: Buffer; contentType: IconType }

async function download(host: string): Promise<Favicon | null> {
  const candidates: string[] = []
  try {
    const page = await safeFetch(`https://${host}/`, { maxBytes: 256 * 1024, accept: "text/html", truncate: true })
    if (page.contentType.includes("html")) candidates.push(...extractIconUrls(page.body.toString("utf8"), page.finalUrl))
  } catch {
    // Sin página: se prueba /favicon.ico directamente.
  }
  candidates.push(`https://${host}/favicon.ico`)

  for (const url of candidates.slice(0, 4)) {
    try {
      const res = await safeFetch(url, { maxBytes: MAX_ICON_BYTES, accept: "image/*" })
      if (res.status !== 200) continue
      const type = sniffIconType(res.body)
      if (type) return { data: res.body, contentType: type }
    } catch {
      // Siguiente candidato.
    }
  }
  return null
}

/** Favicon del dominio desde la caché; si no está o caducó, lo descarga de forma segura. */
export async function getFavicon(db: Db, host: string): Promise<Favicon | null> {
  const [cached] = await db.select().from(faviconCache).where(eq(faviconCache.host, host)).limit(1)
  const age = cached ? Date.now() - cached.fetchedAt.getTime() : Infinity
  if (cached?.missing && age < MISSING_RETRY_MS) return null
  if (cached?.data && cached.contentType && age < FRESH_MS) {
    return { data: cached.data, contentType: cached.contentType as IconType }
  }

  const icon = await download(host)
  const row = { host, data: icon?.data ?? null, contentType: icon?.contentType ?? null, missing: !icon, fetchedAt: new Date() }
  await db.insert(faviconCache).values(row).onConflictDoUpdate({ target: faviconCache.host, set: row })
  return icon
}
