import { defineConfig } from "drizzle-kit"

// Las migraciones se aplican con el rol dueño (DATABASE_URL_OWNER, rama desarrollo de Neon).
// `npm run db:migrate:produccion` usa DATABASE_URL_OWNER_PRODUCCION (rama production).
// La app en ejecución usa DATABASE_URL, con el rol indice_app sin privilegios de dueño.
const production = process.env.DB_TARGET === "produccion"
const url = production ? process.env.DATABASE_URL_OWNER_PRODUCCION : (process.env.DATABASE_URL_OWNER ?? process.env.DATABASE_URL)
if (production && !url) throw new Error("Falta DATABASE_URL_OWNER_PRODUCCION en .env.local.")

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: url ?? "" },
  strict: true,
  verbose: true,
})
