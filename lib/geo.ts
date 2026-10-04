import { z } from "zod"

/** Ciudad elegida por el usuario: nombre, país y el centro de la ciudad (nunca su ubicación exacta). */
export type CityOption = {
  name: string
  countryCode: string
  lat: number
  lng: number
}

/** Redondea a 2 decimales (~1 km): suficiente para el mapa, nada preciso. */
export function roundCoord(value: number): number {
  return Math.round(value * 100) / 100
}

export const cityOption = z.object({
  name: z.string().trim().min(1).max(60),
  countryCode: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/),
  lat: z.number().min(-90).max(90).transform(roundCoord),
  lng: z.number().min(-180).max(180).transform(roundCoord),
})

const countryNames = new Intl.DisplayNames(["es"], { type: "region" })

/** "ES" → "España". */
export function countryName(code: string): string {
  try {
    return countryNames.of(code.toUpperCase()) ?? code
  } catch {
    return code
  }
}

/** "Valencia, España". */
export function cityLabel(city: Pick<CityOption, "name" | "countryCode">): string {
  return `${city.name}, ${countryName(city.countryCode)}`
}

function fold(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim()
}

/** Respaldo sin servicios externos: ciudades frecuentes. */
export const KNOWN_CITIES: CityOption[] = [
  { name: "Madrid", countryCode: "ES", lat: 40.42, lng: -3.7 },
  { name: "Barcelona", countryCode: "ES", lat: 41.39, lng: 2.17 },
  { name: "Valencia", countryCode: "ES", lat: 39.47, lng: -0.38 },
  { name: "Sevilla", countryCode: "ES", lat: 37.39, lng: -5.98 },
  { name: "Bilbao", countryCode: "ES", lat: 43.26, lng: -2.93 },
  { name: "Málaga", countryCode: "ES", lat: 36.72, lng: -4.42 },
  { name: "Zaragoza", countryCode: "ES", lat: 41.65, lng: -0.88 },
  { name: "Ciudad de México", countryCode: "MX", lat: 19.43, lng: -99.13 },
  { name: "Bogotá", countryCode: "CO", lat: 4.71, lng: -74.07 },
  { name: "Buenos Aires", countryCode: "AR", lat: -34.6, lng: -58.38 },
  { name: "Lima", countryCode: "PE", lat: -12.05, lng: -77.04 },
  { name: "Santiago", countryCode: "CL", lat: -33.45, lng: -70.67 },
  { name: "Caracas", countryCode: "VE", lat: 10.48, lng: -66.9 },
  { name: "Quito", countryCode: "EC", lat: -0.18, lng: -78.47 },
  { name: "Montevideo", countryCode: "UY", lat: -34.9, lng: -56.16 },
  { name: "Lisboa", countryCode: "PT", lat: 38.72, lng: -9.14 },
  { name: "Londres", countryCode: "GB", lat: 51.51, lng: -0.13 },
  { name: "París", countryCode: "FR", lat: 48.86, lng: 2.35 },
  { name: "Berlín", countryCode: "DE", lat: 52.52, lng: 13.4 },
  { name: "Nueva York", countryCode: "US", lat: 40.71, lng: -74.01 },
]

export function searchKnownCities(query: string, limit = 6): CityOption[] {
  const q = fold(query)
  if (!q) return []
  return KNOWN_CITIES.filter((c) => fold(c.name).startsWith(q)).slice(0, limit)
}

const photonResponse = z.object({
  features: z.array(
    z.object({
      geometry: z.object({ coordinates: z.tuple([z.number(), z.number()]) }),
      properties: z.object({ name: z.string().optional(), countrycode: z.string().optional() }),
    })
  ),
})

/** Convierte la respuesta de Photon en opciones válidas; ignora lo que no encaje. */
export function parsePhotonResponse(json: unknown): CityOption[] {
  const parsed = photonResponse.safeParse(json)
  if (!parsed.success) return []
  const options: CityOption[] = []
  for (const f of parsed.data.features) {
    const [lng, lat] = f.geometry.coordinates
    const option = cityOption.safeParse({ name: f.properties.name, countryCode: f.properties.countrycode, lat, lng })
    if (option.success) options.push(option.data)
  }
  return options
}

/** Une resultados y quita repetidos (mismo nombre y país). */
export function mergeCityOptions(lists: CityOption[][], limit = 6): CityOption[] {
  const seen = new Set<string>()
  const out: CityOption[] = []
  for (const option of lists.flat()) {
    const key = `${fold(option.name)}|${option.countryCode}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(option)
    if (out.length >= limit) break
  }
  return out
}
