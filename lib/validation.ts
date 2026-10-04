import { z } from "zod"

const TRACKING_PARAMS = /^(utm_[a-z]+|fbclid|gclid|mc_eid|ref_src)$/i

/** URL pública http(s). Rechaza javascript:, data:, file: y similares. */
export const httpUrl = z
  .string()
  .trim()
  .max(2048, "La URL es demasiado larga.")
  .refine((value) => {
    try {
      const url = new URL(value)
      return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.length > 0
    } catch {
      return false
    }
  }, "Escribe una URL que empiece por http:// o https://.")

/** Forma canónica para detectar duplicados: sin fragmento, sin parámetros de rastreo, sin barra final. */
export function normalizeUrl(value: string): string {
  const url = new URL(value)
  url.hash = ""
  url.hostname = url.hostname.toLowerCase()
  for (const key of [...url.searchParams.keys()]) {
    if (TRACKING_PARAMS.test(key)) url.searchParams.delete(key)
  }
  url.searchParams.sort()
  const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : ""
  return `${url.protocol}//${url.host}${path}${url.search}`
}

export const tagList = z
  .array(z.string().trim().toLowerCase().min(1).max(40))
  .max(10, "Como máximo 10 tags.")
  .transform((tags) => [...new Set(tags)])

export const newLinkInput = z.object({
  url: httpUrl,
  name: z.string().trim().min(1, "Ponle un nombre.").max(200),
  categoryId: z.string().min(1).max(64).nullish(),
  tags: tagList.default([]),
  pinned: z.boolean().default(false),
})

export type NewLinkInput = z.input<typeof newLinkInput>
