import { lt } from "drizzle-orm"
import { rateLimit, session, verification } from "@/db/schema"
import type { Db } from "@/lib/dal/types"

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Retención (ver docs/compliance.md): borra sesiones y códigos caducados y los
 * contadores de límite de uso de hace más de un día. No toca cuentas ni enlaces.
 */
export async function cleanupExpired(db: Db, now = new Date()) {
  const sessions = await db.delete(session).where(lt(session.expiresAt, now)).returning({ id: session.id })
  const codes = await db.delete(verification).where(lt(verification.expiresAt, now)).returning({ id: verification.id })
  const limits = await db
    .delete(rateLimit)
    .where(lt(rateLimit.lastRequest, now.getTime() - DAY_MS))
    .returning({ id: rateLimit.id })
  return { sessions: sessions.length, codes: codes.length, limits: limits.length }
}
