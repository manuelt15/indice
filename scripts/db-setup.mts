/**
 * Prepara la base de datos de Neon. Uso: npm run db:setup
 *
 * 1. Aplica las migraciones con el rol dueño.
 * 2. Da acceso (LOGIN) al rol indice_app con una contraseña aleatoria nueva.
 * 3. Escribe en .env.local:
 *      DATABASE_URL_OWNER = conexión del dueño (solo migraciones)
 *      DATABASE_URL       = conexión de indice_app (la que usa la app)
 *
 * Nunca imprime contraseñas ni cadenas de conexión.
 */
import { randomBytes } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import { neonConfig, Pool } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"
import { migrate } from "drizzle-orm/neon-serverless/migrator"

const ENV_FILE = ".env.local"
const APP_ROLE = "indice_app"

function readEnv(): Map<string, string> {
  const map = new Map<string, string>()
  for (const line of readFileSync(ENV_FILE, "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (match) map.set(match[1], match[2])
  }
  return map
}

function setEnv(key: string, value: string) {
  const lines = readFileSync(ENV_FILE, "utf8").split("\n")
  const index = lines.findIndex((l) => l.startsWith(`${key}=`))
  if (index >= 0) lines[index] = `${key}=${value}`
  else lines.push(`${key}=${value}`)
  writeFileSync(ENV_FILE, lines.join("\n"), { mode: 0o600 })
}

async function main() {
  neonConfig.webSocketConstructor = WebSocket
  const env = readEnv()
  const ownerUrl = env.get("DATABASE_URL_OWNER") || env.get("DATABASE_URL")
  if (!ownerUrl) throw new Error("Falta DATABASE_URL en .env.local.")
  const owner = new URL(ownerUrl)
  if (owner.username === APP_ROLE) throw new Error("DATABASE_URL ya es de indice_app y no hay DATABASE_URL_OWNER.")

  const pool = new Pool({ connectionString: ownerUrl })
  try {
    console.log("1/3 Aplicando migraciones con el rol dueño…")
    await migrate(drizzle(pool), { migrationsFolder: "db/migrations" })

    console.log("2/3 Activando el rol indice_app con una contraseña nueva…")
    const password = randomBytes(24).toString("base64url") // solo [A-Za-z0-9_-], sin escapes
    await pool.query(`ALTER ROLE ${APP_ROLE} WITH LOGIN PASSWORD '${password}'`)

    console.log("3/3 Guardando las conexiones en .env.local…")
    const app = new URL(ownerUrl)
    app.username = APP_ROLE
    app.password = password
    setEnv("DATABASE_URL_OWNER", owner.toString())
    setEnv("DATABASE_URL", app.toString())
  } finally {
    await pool.end()
  }
  console.log("Listo. La app usará indice_app; el rol dueño queda solo para migraciones.")
}

main().catch((error) => {
  console.error("Error:", error instanceof Error ? error.message : error)
  process.exit(1)
})
