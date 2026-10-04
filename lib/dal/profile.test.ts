import { eq } from "drizzle-orm"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { user } from "@/db/schema"
import { profileRepo } from "@/lib/dal/profile"
import type { Db } from "@/lib/dal/types"
import { createTestDb, createUser } from "@/test/db"

let db: Db
let close: () => Promise<void>

beforeAll(async () => {
  const test = await createTestDb()
  db = test.db
  close = () => test.client.close()
  await createUser(db, "ana")
  await createUser(db, "beto")
})

afterAll(async () => close())

const read = async (id: string) => (await db.select().from(user).where(eq(user.id, id)))[0]

describe("bienvenida", () => {
  it("guarda nombre, ciudad redondeada y la marca de completado solo del propio usuario", async () => {
    await profileRepo(db).completeOnboarding("ana", {
      name: "  Ana  ",
      city: { name: "Madrid", countryCode: "es", lat: 40.416775, lng: -3.70379 },
    })
    const ana = await read("ana")
    expect(ana.name).toBe("Ana")
    expect([ana.city, ana.cityCountry, ana.cityLat, ana.cityLng]).toEqual(["Madrid", "ES", 40.42, -3.7])
    expect(ana.onboardedAt).toBeInstanceOf(Date)

    const beto = await read("beto")
    expect(beto.onboardedAt).toBeNull()
    expect(beto.city).toBeNull()
  })

  it("la ciudad es opcional", async () => {
    await profileRepo(db).completeOnboarding("beto", { name: "Beto", city: null })
    const beto = await read("beto")
    expect(beto.city).toBeNull()
    expect(beto.onboardedAt).toBeInstanceOf(Date)
  })

  it("rechaza nombres vacíos o con marcado", async () => {
    const repo = profileRepo(db)
    await expect(repo.completeOnboarding("ana", { name: "   ", city: null })).rejects.toThrow()
    await expect(repo.completeOnboarding("ana", { name: "<b>Ana</b>", city: null })).rejects.toThrow()
  })
})
