import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core"
import type * as schema from "@/db/schema"

/** Cualquier base de datos Drizzle con nuestro esquema (Neon en la app, PGlite en los tests). */
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0]
