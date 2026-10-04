import { db } from "@/db"
import { auth } from "@/lib/auth"
import { getFavicon, parseIconHost } from "@/lib/favicons.server"

/**
 * Favicon de un dominio, servido desde nuestro servidor para que el navegador
 * del usuario nunca hable con terceros. Solo con sesión iniciada.
 */
export async function GET(request: Request, ctx: { params: Promise<{ host: string }> }) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return new Response(null, { status: 401 })

  const host = parseIconHost((await ctx.params).host)
  if (!host) return new Response(null, { status: 400 })

  const icon = await getFavicon(db, host)
  // Poco tiempo: si la web arregla su icono (o nosotros la descarga), se vuelve a pedir pronto.
  if (!icon) return new Response(null, { status: 404, headers: { "Cache-Control": "private, max-age=3600" } })

  return new Response(new Uint8Array(icon.data), {
    headers: {
      "Content-Type": icon.contentType,
      "Cache-Control": "private, max-age=86400",
      "X-Content-Type-Options": "nosniff",
      // Imprescindible para SVG: aunque se abra la URL directamente, ningún script se ejecuta.
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "Cross-Origin-Resource-Policy": "same-origin",
    },
  })
}
