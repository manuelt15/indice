import { timingSafeEqual } from "node:crypto"
import { db } from "@/db"
import { cleanupExpired } from "@/lib/dal/maintenance"
import { env } from "@/lib/env"

function authorized(header: string | null, secret: string) {
  const expected = Buffer.from(`Bearer ${secret}`)
  const received = Buffer.from(header ?? "")
  return received.length === expected.length && timingSafeEqual(received, expected)
}

/** Limpieza diaria (Vercel Cron, ver vercel.json). Solo con el secreto: nadie más puede lanzarla. */
export async function GET(request: Request) {
  if (!env.CRON_SECRET) return new Response(null, { status: 503 })
  if (!authorized(request.headers.get("authorization"), env.CRON_SECRET)) return new Response(null, { status: 401 })
  const removed = await cleanupExpired(db)
  return Response.json(removed, { headers: { "Cache-Control": "no-store" } })
}
