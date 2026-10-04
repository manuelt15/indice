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
  if (!icon) return new Response(null, { status: 404, headers: { "Cache-Control": "private, max-age=86400" } })

  return new Response(new Uint8Array(icon.data), {
    headers: {
      "Content-Type": icon.contentType,
      "Cache-Control": "private, max-age=86400",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  })
}
