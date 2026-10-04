const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " }

function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m)
}

function attr(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"))
  return match ? (match[2] ?? match[3] ?? match[4] ?? null) : null
}

/** Título de la página, limpio y de 200 caracteres como máximo. Nunca se renderiza como HTML. */
export function extractTitle(html: string): string | null {
  const og = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]).find((t) => /property\s*=\s*["']?og:title/i.test(t))
  const raw = (og && attr(og, "content")) ?? html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? null
  if (!raw) return null
  const clean = decodeEntities(raw).replace(/\s+/g, " ").trim().slice(0, 200)
  return clean || null
}

/** URLs absolutas de los iconos declarados en la página, del más pequeño útil al resto. */
export function extractIconUrls(html: string, baseUrl: string): string[] {
  const urls: string[] = []
  for (const [tag] of html.matchAll(/<link\b[^>]*>/gi)) {
    const rel = (attr(tag, "rel") ?? "").toLowerCase()
    if (!/\bicon\b/.test(rel) || rel.includes("mask-icon")) continue
    const href = attr(tag, "href")
    if (!href) continue
    try {
      const url = new URL(decodeEntities(href), baseUrl)
      if (url.protocol === "http:" || url.protocol === "https:") urls.push(url.toString())
    } catch {
      // href inválido: se ignora
    }
  }
  return urls
}
