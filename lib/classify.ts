/**
 * Clasificación por reglas (gratis, sin IA, sin enviar nada a terceros).
 * Puntúa cada categoría según el dominio, la ruta y el título del enlace.
 */

export const DEFAULT_CATEGORIES = ["UI", "Diseño", "IA", "Dev", "Aprender", "Personal"] as const
export type DefaultCategory = (typeof DEFAULT_CATEGORIES)[number]

type Rule = { hosts: RegExp[]; words: string[] }

const RULES: Record<DefaultCategory, Rule> = {
  UI: {
    hosts: [/shadcn/, /uiverse/, /reactbits/, /skiper-ui/, /ui-layouts/, /beautifului/, /mdxcn/, /mapcn/, /freesets/, /htmlrev/, /resetcss/, /react\.email/, /blobatar/, /tailwindui/, /aceternity/, /magicui/, /radix-ui/, /headlessui/, /daisyui/, /flowbite/],
    words: ["component", "components", "componente", "componentes", "ui", "blocks", "bloques", "templates", "template", "plantillas", "library", "libraries", "librerias", "librería", "librerías", "css", "tailwind", "primitives", "react", "kit", "animations"],
  },
  Diseño: {
    hosts: [/mobbin/, /pixelcrash/, /texturelabs/, /fontpair/, /refero/, /dribbble/, /behance/, /figma/, /coolors/, /awwwards/, /typescale/, /realtimecolors/, /fonts\.google/, /fontshare/],
    words: ["design", "diseño", "inspiration", "inspiración", "font", "fonts", "tipografía", "typography", "color", "colors", "colores", "palette", "paleta", "textures", "texturas", "guidelines", "styles", "estilos", "interface", "mockup"],
  },
  IA: {
    hosts: [/ollama/, /huggingface/, /nousresearch/, /openai/, /anthropic/, /claude/, /mistral/, /replicate/, /skills\.sh/, /autoskills/, /tasteskill/, /heygen/, /vgpu/, /perplexity/, /groq/, /together\.ai/, /ai-sdk/],
    words: ["ai", "ia", "llm", "llms", "gpt", "agent", "agents", "agente", "agentes", "mcp", "skill", "skills", "model", "models", "modelo", "modelos", "inference", "gpu", "prompt", "prompts", "embedding", "embeddings", "datasets"],
  },
  Dev: {
    hosts: [/vercel\.com/, /mongodb/, /hostinger/, /netlify/, /supabase/, /neon\.tech/, /npmjs/, /stackoverflow/, /developer\.mozilla/, /nextjs\.org/, /caniuse/, /regex101/, /bundlephobia/, /github\.com/, /gitlab/, /docker/, /cloudflare/],
    words: ["docs", "documentation", "documentación", "database", "deploy", "hosting", "install", "api", "sdk", "cloud", "server", "manual", "cli", "npm", "framework", "backend", "devops"],
  },
  Aprender: {
    hosts: [/exercism/, /learn-anything/, /freecodecamp/, /udemy/, /coursera/, /frontendmasters/, /egghead/, /codecademy/, /platzi/, /web\.dev/, /joshwcomeau/],
    words: ["learn", "learning", "aprender", "course", "courses", "curso", "cursos", "tutorial", "tutorials", "exercise", "exercises", "ejercicios", "tracks", "lessons", "lecciones", "roadmap"],
  },
  Personal: {
    hosts: [/linkedin\.com\/in/, /protonvpn/, /proton\.me/, /haveibeenpwned/, /workforce/, /bank/, /banco/],
    words: ["login", "iniciar sesión", "sign in", "account", "cuenta", "perfil", "profile", "vpn", "privacidad", "privacy", "pwned", "dashboard", "mi cuenta", "gastos", "portfolio"],
  },
}

// Si dos categorías empatan, gana la primera de esta lista (más específica primero).
const TIE_ORDER: DefaultCategory[] = ["Personal", "Diseño", "UI", "Aprender", "IA", "Dev"]

export type Classification = { category: DefaultCategory; reasons: string[] } | null

function fold(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
}

function words(text: string): Set<string> {
  return new Set(fold(text).split(/[^a-z0-9ñ.]+/).filter(Boolean).map((w) => w.replace(/^\.+|\.+$/g, "")))
}

/**
 * Propone una categoría para un enlace. `ownerName` sirve para reconocer páginas
 * personales del propio usuario ("Manuel Torres" en el título).
 */
export function classifyLink(input: { url: string; title?: string | null; ownerName?: string | null }): Classification {
  let url: URL
  try {
    url = new URL(input.url)
  } catch {
    return null
  }
  const host = url.hostname.replace(/^www\./, "").toLowerCase()
  const hostAndPath = `${host}${url.pathname}`.toLowerCase()
  const title = input.title ?? ""
  const tokens = new Set([...words(title), ...words(url.pathname.replace(/[-_/]/g, " ")), ...words(host.split(".").slice(0, -1).join(" "))])
  const titleFolded = fold(title)

  const scores = new Map<DefaultCategory, { score: number; reasons: string[] }>()
  const add = (cat: DefaultCategory, points: number, reason: string) => {
    const entry = scores.get(cat) ?? { score: 0, reasons: [] }
    entry.score += points
    if (!entry.reasons.includes(reason)) entry.reasons.push(reason)
    scores.set(cat, entry)
  }

  for (const cat of DEFAULT_CATEGORIES) {
    const rule = RULES[cat]
    if (rule.hosts.some((re) => re.test(hostAndPath))) add(cat, 3, host)
    for (const w of rule.words) {
      const hit = w.includes(" ") ? titleFolded.includes(fold(w)) : tokens.has(fold(w))
      if (hit) add(cat, 1, w)
    }
  }

  // Perfil de GitHub (github.com/usuario) o página propia del usuario: Personal.
  if (host === "github.com" && url.pathname.split("/").filter(Boolean).length === 1) add("Personal", 4, "perfil de GitHub")
  const owner = input.ownerName?.trim()
  if (owner && owner.length >= 3 && titleFolded.includes(fold(owner))) add("Personal", 4, "tu nombre")
  if (/\.vercel\.app$|\.netlify\.app$|\.github\.io$/.test(host)) add("Personal", 1, "proyecto propio")

  let best: { cat: DefaultCategory; score: number } | null = null
  for (const cat of TIE_ORDER) {
    const s = scores.get(cat)?.score ?? 0
    if (s > 0 && (!best || s > best.score)) best = { cat, score: s }
  }
  return best ? { category: best.cat, reasons: scores.get(best.cat)!.reasons.slice(0, 3) } : null
}
