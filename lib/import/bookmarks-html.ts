/**
 * Lector del archivo de marcadores que exportan Chrome, Edge, Firefox y Safari
 * (formato "Netscape Bookmark File"). Solo extrae texto: nunca se renderiza el HTML.
 */

export type ParsedBookmark = {
  url: string
  name: string
  /** Carpetas desde la raíz, sin las contenedoras del navegador ("Barra de marcadores"…). */
  folders: string[]
  addedAt: number | null // milisegundos
}

export type ParseResult = {
  bookmarks: ParsedBookmark[]
  /** Entradas que no son http(s): bookmarklets (javascript:), chrome://, file://… */
  skipped: number
}

export const MAX_FILE_BYTES = 5 * 1024 * 1024
export const MAX_BOOKMARKS = 5000

/** Carpetas raíz de los navegadores: no son categorías del usuario. */
const ROOT_FOLDERS = new Set(
  [
    "barra de marcadores",
    "barra de favoritos",
    "otros marcadores",
    "otros favoritos",
    "marcadores del móvil",
    "marcadores de móvil",
    "bookmarks bar",
    "bookmarks toolbar",
    "favorites bar",
    "other bookmarks",
    "other favorites",
    "mobile bookmarks",
    "bookmarks menu",
    "menú de marcadores",
    "barra de herramientas de marcadores",
    "favoritos",
    "marcadores",
    "bookmarks",
  ].map((s) => s.toLowerCase())
)

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " }

function decode(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function attr(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"))
  return match ? (match[2] ?? match[3] ?? match[4] ?? null) : null
}

function isRootFolder(tag: string, name: string): boolean {
  return /PERSONAL_TOOLBAR_FOLDER|UNFILED_BOOKMARKS_FOLDER/i.test(tag) || ROOT_FOLDERS.has(name.toLowerCase())
}

function isHttp(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === "http:" || u.protocol === "https:"
  } catch {
    return false
  }
}

export function parseBookmarksHtml(html: string): ParseResult {
  const bookmarks: ParsedBookmark[] = []
  let skipped = 0
  const stack: (string | null)[] = [] // null = carpeta raíz del navegador
  let pendingFolder: string | null | undefined

  const token = /<h3\b([^>]*)>([\s\S]*?)<\/h3>|<dl\b[^>]*>|<\/dl\s*>|<a\b([^>]*)>([\s\S]*?)<\/a>/gi
  for (const m of html.matchAll(token)) {
    const raw = m[0].slice(0, 4).toLowerCase()
    if (raw.startsWith("<h3")) {
      const name = decode(m[2] ?? "")
      pendingFolder = isRootFolder(m[1] ?? "", name) || !name ? null : name.slice(0, 40)
    } else if (raw.startsWith("<dl")) {
      stack.push(pendingFolder === undefined ? null : pendingFolder)
      pendingFolder = undefined
    } else if (raw.startsWith("</dl")) {
      stack.pop()
    } else {
      const tag = m[3] ?? ""
      const url = decode(attr(tag, "href") ?? "")
      if (!isHttp(url) || url.length > 2048) {
        skipped++
        continue
      }
      const added = Number(attr(tag, "add_date"))
      bookmarks.push({
        url,
        name: (decode(m[4] ?? "") || new URL(url).hostname).slice(0, 200),
        folders: stack.filter((f): f is string => !!f),
        addedAt: Number.isFinite(added) && added > 0 ? added * 1000 : null,
      })
    }
  }
  return { bookmarks, skipped }
}
