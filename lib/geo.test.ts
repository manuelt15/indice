import { describe, expect, it, vi } from "vitest"
import { cityLabel, cityOption, mergeCityOptions, parsePhotonResponse, roundCoord, searchKnownCities } from "@/lib/geo"

vi.mock("server-only", () => ({}))

describe("ciudades", () => {
  it("redondea a unos 1 km para no guardar ubicaciones precisas", () => {
    expect(roundCoord(40.416775)).toBe(40.42)
    expect(cityOption.parse({ name: "Madrid", countryCode: "es", lat: 40.416775, lng: -3.70379 })).toEqual({
      name: "Madrid",
      countryCode: "ES",
      lat: 40.42,
      lng: -3.7,
    })
  })

  it("rechaza coordenadas imposibles o países mal formados", () => {
    expect(cityOption.safeParse({ name: "X", countryCode: "ES", lat: 120, lng: 0 }).success).toBe(false)
    expect(cityOption.safeParse({ name: "X", countryCode: "ESP", lat: 0, lng: 0 }).success).toBe(false)
  })

  it("busca en la lista local sin importar tildes ni mayúsculas", () => {
    expect(searchKnownCities("bogo").map((c) => c.name)).toEqual(["Bogotá"])
    expect(searchKnownCities("MAL").map((c) => c.name)).toEqual(["Málaga"])
  })

  it("muestra el país en español", () => {
    expect(cityLabel({ name: "Valencia", countryCode: "ES" })).toBe("Valencia, España")
  })

  it("convierte la respuesta de Photon y descarta lo inválido", () => {
    const options = parsePhotonResponse({
      features: [
        { geometry: { coordinates: [-68.0, 10.17] }, properties: { name: "Valencia", countrycode: "VE" } },
        { geometry: { coordinates: [0, 0] }, properties: {} },
      ],
    })
    expect(options).toEqual([{ name: "Valencia", countryCode: "VE", lat: 10.17, lng: -68 }])
    expect(parsePhotonResponse({ nada: true })).toEqual([])
  })

  it("une listas sin repetir la misma ciudad", () => {
    const madrid = { name: "Madrid", countryCode: "ES", lat: 40.42, lng: -3.7 }
    expect(mergeCityOptions([[madrid], [{ ...madrid, lat: 40.4168 }]])).toHaveLength(1)
  })
})

describe("searchCities (servidor)", () => {
  it("si Photon falla, devuelve la lista local", async () => {
    const { searchCities } = await import("@/lib/geo.server")
    const failing = vi.fn().mockRejectedValue(new Error("sin red"))
    expect((await searchCities("Madr", failing)).map((c) => c.name)).toEqual(["Madrid"])
  })

  it("pide a Photon solo con el texto, a un host fijo", async () => {
    const { searchCities } = await import("@/lib/geo.server")
    const ok = vi.fn().mockResolvedValue(new Response(JSON.stringify({ features: [] }), { status: 200 }))
    await searchCities("Valencia", ok)
    const url = new URL(ok.mock.calls[0][0])
    expect(url.origin).toBe("https://photon.komoot.io")
    expect(url.searchParams.get("q")).toBe("Valencia")
  })
})
