import { afterEach, describe, expect, it, vi } from "vitest"
import { GET } from "./route"

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe("proxy del mapa", () => {
  it("sirve las URLs de CARTO desde el mismo origen", async () => {
    vi.stubEnv("CARTO_BASEMAPS_API_KEY", "test-key")
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      sprite: "https://tiles.basemaps.cartocdn.com/gl/positron-gl-style/sprite",
      tiles: ["https://tiles-a.basemaps.cartocdn.com/vectortiles/{z}/{x}/{y}.mvt"],
    }), { headers: { "Content-Type": "application/json" } }))
    vi.stubGlobal("fetch", fetchMock)

    const request = new Request("https://indice.dev/api/map/style/positron-gl-style/style.json")
    const response = await GET(request, { params: Promise.resolve({ path: ["style", "positron-gl-style", "style.json"] }) })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledWith("https://basemaps.cartocdn.com/gl/positron-gl-style/style.json?key=test-key", expect.any(Object))
    expect(body.sprite).toBe("https://indice.dev/api/map/tiles/gl/positron-gl-style/sprite")
    expect(body.tiles[0]).toBe("https://indice.dev/api/map/tiles-a/vectortiles/{z}/{x}/{y}.mvt")
    expect(JSON.stringify(body)).not.toContain("test-key")
  })

  it("rechaza un origen ajeno", async () => {
    vi.stubEnv("CARTO_BASEMAPS_API_KEY", "test-key")
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const response = await GET(new Request("https://indice.dev/api/map/otro/style.json"), {
      params: Promise.resolve({ path: ["otro", "style.json"] }),
    })
    expect(response.status).toBe(404)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("no consulta CARTO sin una clave propia", async () => {
    vi.stubEnv("CARTO_BASEMAPS_API_KEY", "")
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const response = await GET(new Request("https://indice.dev/api/map/style/positron-gl-style/style.json"), {
      params: Promise.resolve({ path: ["style", "positron-gl-style", "style.json"] }),
    })
    expect(response.status).toBe(503)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("solo sirve lo que usa nuestro mapa", async () => {
    vi.stubEnv("CARTO_BASEMAPS_API_KEY", "test-key")
    const fetchMock = vi.fn().mockImplementation(async () => new Response("x", { headers: { "Content-Type": "application/x-protobuf" } }))
    vi.stubGlobal("fetch", fetchMock)
    const status = async (path: string[]) =>
      (await GET(new Request(`https://indice.dev/api/map/${path.join("/")}`), { params: Promise.resolve({ path }) })).status

    expect(await status(["tiles-b", "vectortiles", "carto.streets", "v1", "11", "1003", "772.mvt"])).toBe(200)
    expect(await status(["tiles", "fonts", "Montserrat Medium,Open Sans Bold", "0-255.pbf"])).toBe(200)
    expect(await status(["tiles", "gl", "dark-matter-gl-style", "sprite@2x.png"])).toBe(200)
    // Zoom alto: lo que pediría alguien que quisiera descargar el mapa entero.
    expect(await status(["tiles-a", "vectortiles", "carto.streets", "v1", "15", "16000", "12000.mvt"])).toBe(404)
    expect(await status(["style", "otro-estilo", "style.json"])).toBe(404)
    expect(await status(["tiles", "raster", "light_all", "1", "0", "0.png"])).toBe(404)
    expect(await status(["constructor", "x"])).toBe(404)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })
})
