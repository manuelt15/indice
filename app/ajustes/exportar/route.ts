import { db } from "@/db"
import { auth } from "@/lib/auth"
import { exportAccount } from "@/lib/dal/account"

/** Descarga de todos los datos del usuario de la sesión (RGPD: acceso y portabilidad). */
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return new Response(null, { status: 401 })

  const data = await exportAccount(db, session.user.id)
  const day = new Date().toISOString().slice(0, 10)
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="indice-${day}.json"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
