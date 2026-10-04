import "server-only"
import { z } from "zod"

const schema = z.object({
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET debe tener al menos 32 caracteres."),
  BETTER_AUTH_URL: z.url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  // Vercel Cron la envía como "Authorization: Bearer …". Sin ella, la limpieza no se ejecuta.
  CRON_SECRET: z.string().min(32, "CRON_SECRET debe tener al menos 32 caracteres.").optional(),
})

/** Variables de entorno del servidor, validadas una vez. Nunca se exponen al navegador. */
export const env = (() => {
  const parsed = schema.safeParse(process.env)
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.path.join(".")).join(", ")
    throw new Error(`Faltan o son inválidas estas variables de entorno: ${missing}. Revisa .env.local (plantilla en .env.example).`)
  }
  return parsed.data
})()
