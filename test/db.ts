import { PGlite } from "@electric-sql/pglite"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import * as schema from "@/db/schema"
import type { Db } from "@/lib/dal/types"

/**
 * Postgres en memoria con las migraciones reales aplicadas.
 * Tras migrar, la sesión pasa al rol indice_app (sin privilegios de dueño),
 * igual que la app en producción, para que Row Level Security aplique.
 */
export async function createTestDb() {
  const client = new PGlite()
  const db = drizzle(client, { schema })
  await migrate(db, { migrationsFolder: "db/migrations" })
  await client.exec("SET ROLE indice_app")
  return { db: db as unknown as Db, client }
}

export async function createUser(db: Db, id: string) {
  await db.insert(schema.user).values({ id, name: id, email: `${id}@example.com` })
  return id
}
