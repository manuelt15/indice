import "server-only"
import { Pool } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"
import * as schema from "@/db/schema"
import { env } from "@/lib/env"

// Pool por WebSocket: permite transacciones, necesarias para Row Level Security (lib/dal/with-user.ts).
const pool = new Pool({ connectionString: env.DATABASE_URL })

export const db = drizzle(pool, { schema })
