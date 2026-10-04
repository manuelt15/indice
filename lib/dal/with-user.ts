import { sql } from "drizzle-orm"
import type { Db, Tx } from "@/lib/dal/types"

/**
 * Ejecuta fn en una transacción con el usuario fijado para Row Level Security.
 * set_config(..., true) solo vive dentro de la transacción, así que no se filtra
 * a otras peticiones aunque la conexión se reutilice (pooling).
 */
export async function withUser<T>(db: Db, userId: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
  if (!userId) throw new Error("withUser necesita un usuario.")
  return db.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.user_id', ${userId}, true)`)
    return fn(tx)
  })
}
