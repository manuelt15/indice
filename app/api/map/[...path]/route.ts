const HOSTS: Record<string, string> = {
  style: "basemaps.cartocdn.com",
  tiles: "tiles.basemaps.cartocdn.com",
  "tiles-a": "tiles-a.basemaps.cartocdn.com",
  "tiles-b": "tiles-b.basemaps.cartocdn.com",
  "tiles-c": "tiles-c.basemaps.cartocdn.com",
  "tiles-d": "tiles-d.basemaps.cartocdn.com",
}

const TILE_HOST = /https:\/\/(tiles(?:-[a-d])?)\.basemaps\.cartocdn\.com/g

/** Proxy de CARTO: el navegador solo contacta con nuestro origen. */
export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const key = process.env.CARTO_BASEMAPS_API_KEY
  if (!key) return new Response(null, { status: 503 })

  const [source, ...path] = (await params).path
  const host = HOSTS[source]
  if (!host || path.length === 0 || path.some((part) => part === "." || part === "..")) {
    return new Response(null, { status: 404 })
  }

  const upstreamUrl = new URL(`https://${host}/${source === "style" ? "gl/" : ""}${path.map(encodeURIComponent).join("/")}`)
  upstreamUrl.searchParams.set("key", key)
  try {
    const upstream = await fetch(upstreamUrl.toString(), {
      redirect: "error",
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 86400 },
    })
    if (!upstream.ok) return new Response(null, { status: upstream.status })

    const contentType = upstream.headers.get("content-type") ?? "application/octet-stream"
    const headers = { "Content-Type": contentType, "Cache-Control": "public, max-age=86400" }
    if (contentType.includes("json")) {
      const body = (await upstream.text()).replace(TILE_HOST, (_match, subdomain: string) => new URL(`/api/map/${subdomain}`, request.url).href)
      return new Response(body, { headers })
    }
    return new Response(upstream.body, { headers })
  } catch {
    return new Response(null, { status: 502 })
  }
}
