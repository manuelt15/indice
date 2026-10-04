import type { IndexItem } from "@/components/ds/index-list"

/** Enlaces de ejemplo para /kit y la landing. Nunca son datos de un usuario. */
export const SAMPLE_LINKS: (IndexItem & { category: string })[] = [
  { id: "1", name: "shadcn/ui", href: "https://ui.shadcn.com", host: "ui.shadcn.com", category: "UI", isNew: true },
  { id: "2", name: "Radix Icons", href: "https://www.radix-ui.com/icons", host: "radix-ui.com", category: "UI" },
  { id: "3", name: "Tailwind CSS", href: "https://tailwindcss.com", host: "tailwindcss.com", category: "UI" },
  { id: "4", name: "Mobbin", href: "https://mobbin.com", host: "mobbin.com", category: "Diseño" },
  { id: "5", name: "Typescale", href: "https://typescale.com", host: "typescale.com", category: "Diseño" },
  { id: "6", name: "Excalidraw", href: "https://excalidraw.com", host: "excalidraw.com", category: "Diseño" },
  { id: "7", name: "Next.js", href: "https://nextjs.org/docs", host: "nextjs.org", category: "Dev", isNew: true },
  { id: "8", name: "MDN Web Docs", href: "https://developer.mozilla.org", host: "developer.mozilla.org", category: "Dev" },
  { id: "9", name: "Can I use", href: "https://caniuse.com", host: "caniuse.com", category: "Dev" },
  { id: "10", name: "Hugging Face", href: "https://huggingface.co", host: "huggingface.co", category: "IA" },
  { id: "11", name: "Ollama", href: "https://ollama.com", host: "ollama.com", category: "IA" },
  { id: "12", name: "Ñandú, guía de estilo", href: "https://example.com", host: "example.com", category: "Aprender" },
]

/** 26 semanas de actividad de ejemplo, deterministas. */
export function sampleHeatWeeks() {
  const months = ["abr", "may", "jun", "jul", "ago", "sep"]
  let seed = 7
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280
  return Array.from({ length: 26 }, (_, w) => ({
    month: Math.floor((w * months.length) / 26) !== Math.floor(((w - 1) * months.length) / 26) || w === 0
      ? months[Math.floor((w * months.length) / 26)]
      : undefined,
    counts: Array.from({ length: 7 }, () => {
      const v = rnd()
      return v > 0.93 ? 4 : v > 0.85 ? 3 : v > 0.74 ? 2 : v > 0.6 ? 1 : 0
    }),
  }))
}
