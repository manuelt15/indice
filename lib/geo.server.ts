import "server-only"
import { mergeCityOptions, parsePhotonResponse, searchKnownCities, type CityOption } from "@/lib/geo"

// Host fijo: el usuario solo controla el texto de búsqueda, nunca la URL (sin riesgo de SSRF).
const PHOTON_URL = "https://photon.komoot.io/api/"

/**
 * Busca ciudades. Primero la lista local (sin salir del servidor); luego Photon
 * (OpenStreetMap, servidores en la UE). El navegador nunca habla con Photon.
 */
export async function searchCities(query: string, fetchImpl: typeof fetch = fetch): Promise<CityOption[]> {
  const q = query.trim().slice(0, 60)
  if (q.length < 2) return []
  const known = searchKnownCities(q)
  try {
    const url = new URL(PHOTON_URL)
    url.searchParams.set("q", q)
    url.searchParams.set("limit", "6")
    url.searchParams.set("layer", "city")
    const response = await fetchImpl(url, {
      headers: { "User-Agent": "indice/1.0 (+https://github.com/manuelt15/indice)" },
      signal: AbortSignal.timeout(3000),
      redirect: "error",
    })
    if (!response.ok) return known
    return mergeCityOptions([known, parsePhotonResponse(await response.json())])
  } catch {
    return known
  }
}
