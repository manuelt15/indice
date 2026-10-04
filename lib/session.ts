import "server-only"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

/** Sesión actual o null. Solo en el servidor. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

/** Usuario de la sesión; si no hay sesión, manda a /entrar. */
export async function requireUser() {
  const session = await getSession()
  if (!session) redirect("/entrar")
  return session.user
}

/** Como requireUser, pero si aún no ha hecho la bienvenida, manda a /bienvenida. */
export async function requireOnboardedUser() {
  const user = await requireUser()
  if (!user.onboardedAt) redirect("/bienvenida")
  return user
}
