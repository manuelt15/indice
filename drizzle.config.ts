import { defineConfig } from "drizzle-kit"

// Las migraciones se aplican con el rol dueño (DATABASE_URL_OWNER).
// La app en ejecución usa DATABASE_URL, con el rol indice_app sin privilegios de dueño.
export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL_OWNER ?? process.env.DATABASE_URL ?? "" },
  strict: true,
  verbose: true,
})
