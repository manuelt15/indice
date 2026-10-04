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
      acceptTerms: true,
    })
    const ana = await read("ana")
    expect(ana.name).toBe("Ana")
    expect([ana.city, ana.cityCountry, ana.cityLat, ana.cityLng]).toEqual(["Madrid", "ES", 40.42, -3.7])
    expect(ana.onboardedAt).toBeInstanceOf(Date)
    expect(ana.termsAcceptedAt).toBeInstanceOf(Date)

    const beto = await read("beto")
    expect(beto.onboardedAt).toBeNull()
    expect(beto.city).toBeNull()
  })

  it("la ciudad es opcional", async () => {
    await profileRepo(db).completeOnboarding("beto", { name: "Beto", city: null, acceptTerms: true })
    const beto = await read("beto")
    expect(beto.city).toBeNull()
    expect(beto.onboardedAt).toBeInstanceOf(Date)
  })

  it("rechaza nombres vacíos o con marcado", async () => {
    const repo = profileRepo(db)
    await expect(repo.completeOnboarding("ana", { name: "   ", city: null, acceptTerms: true })).rejects.toThrow()
    await expect(repo.completeOnboarding("ana", { name: "<b>Ana</b>", city: null, acceptTerms: true })).rejects.toThrow()
  })
})

describe("términos", () => {
  it("sin aceptar los términos no se completa la bienvenida", async () => {
    await createUser(db, "carla")
    const repo = profileRepo(db)
    // @ts-expect-error: el cliente podría mandar cualquier cosa
    await expect(repo.completeOnboarding("carla", { name: "Carla", city: null, acceptTerms: false })).rejects.toThrow()
    // @ts-expect-error: falta la aceptación
    await expect(repo.completeOnboarding("carla", { name: "Carla", city: null })).rejects.toThrow()
    expect((await read("carla")).onboardedAt).toBeNull()
  })

  it("una cuenta antigua registra la aceptación una vez", async () => {
    await createUser(db, "dani")
    await profileRepo(db).acceptTerms("dani")
    expect((await read("dani")).termsAcceptedAt).toBeInstanceOf(Date)
  })
})

describe("ajustes", () => {
  it("cambia nombre y ciudad solo del propio usuario, y permite quitar la ciudad", async () => {
    const repo = profileRepo(db)
    await repo.update("ana", { name: "Ana María", city: { name: "Sevilla", countryCode: "ES", lat: 37.3891, lng: -5.9845 } })
    expect([(await read("ana")).name, (await read("ana")).city, (await read("ana")).cityLat]).toEqual(["Ana María", "Sevilla", 37.39])
    expect((await read("beto")).name).toBe("Beto")

    await repo.update("ana", { name: "Ana", city: null })
    const ana = await read("ana")
    expect([ana.city, ana.cityCountry, ana.cityLat, ana.cityLng]).toEqual([null, null, null, null])
  })

  it("valida igual que la bienvenida", async () => {
    await expect(profileRepo(db).update("ana", { name: "<script>", city: null })).rejects.toThrow()
  })
})
