import { afterAll, beforeAll, describe, expect, it } from "vitest"
import * as schema from "@/db/schema"
import { cleanupExpired } from "@/lib/dal/maintenance"
import type { Db } from "@/lib/dal/types"
import { createTestDb, createUser } from "@/test/db"

let db: Db
let close: () => Promise<void>
const now = new Date("2026-10-04T12:00:00Z")
const past = new Date(now.getTime() - 60_000)
const future = new Date(now.getTime() + 60_000)

beforeAll(async () => {
  const test = await createTestDb()
  db = test.db
  close = () => test.client.close()
  await createUser(db, "ana")
  await db.insert(schema.session).values([
    { id: "vieja", token: "t1", userId: "ana", expiresAt: past },
    { id: "viva", token: "t2", userId: "ana", expiresAt: future },
  ])
  await db.insert(schema.verification).values([
    { id: "c-vieja", identifier: "sign-in-otp-ana@example.com", value: "h", expiresAt: past },
    { id: "c-viva", identifier: "sign-in-otp-ana@example.com", value: "h", expiresAt: future },
  ])
  await db.insert(schema.rateLimit).values([
    { id: "r-vieja", key: "ip/a", count: 3, lastRequest: now.getTime() - 2 * 24 * 60 * 60 * 1000 },
    { id: "r-viva", key: "ip/b", count: 1, lastRequest: now.getTime() - 60_000 },
  ])
})

afterAll(async () => close())

describe("limpieza diaria", () => {
  it("borra solo lo caducado y nunca la cuenta", async () => {
    expect(await cleanupExpired(db, now)).toEqual({ sessions: 1, codes: 1, limits: 1 })
    expect((await db.select().from(schema.session)).map((s) => s.id)).toEqual(["viva"])
    expect((await db.select().from(schema.verification)).map((v) => v.id)).toEqual(["c-viva"])
    expect((await db.select().from(schema.rateLimit)).map((r) => r.id)).toEqual(["r-viva"])
    expect(await db.select().from(schema.user)).toHaveLength(1)
  })

  it("si no hay nada caducado, no borra nada", async () => {
    expect(await cleanupExpired(db, now)).toEqual({ sessions: 0, codes: 0, limits: 0 })
  })
})
