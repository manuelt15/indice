import { describe, expect, it } from "vitest"
import { heatWeeks, relativeDay } from "@/lib/stats"

const now = new Date(2026, 9, 4) // domingo 4 de octubre de 2026

describe("heatWeeks", () => {
  it("cuenta por día y deja la semana actual al final", () => {
    const weeks = heatWeeks([new Date(2026, 9, 4, 10), new Date(2026, 9, 4, 18), new Date(2026, 8, 28)], now)
    expect(weeks).toHaveLength(26)
    expect(weeks[25].counts).toEqual([1, 0, 0, 0, 0, 0, 2]) // lunes 28 sep y domingo 4 oct
  })

  it("ignora fechas fuera del periodo", () => {
    const weeks = heatWeeks([new Date(2024, 0, 1), new Date(2027, 0, 1)], now)
    expect(weeks.flatMap((w) => w.counts).reduce((a, b) => a + b, 0)).toBe(0)
  })

  it("marca el mes cuando cambia", () => {
    const labels = heatWeeks([], now).map((w) => w.month).filter(Boolean)
    expect(labels.at(-1)).toBe("sep")
    expect(new Set(labels).size).toBe(labels.length)
  })
})

describe("relativeDay", () => {
  it("habla como una persona", () => {
    expect(relativeDay(new Date(2026, 9, 4), now)).toBe("Hoy")
    expect(relativeDay(new Date(2026, 9, 3), now)).toBe("Ayer")
    expect(relativeDay(new Date(2026, 8, 29), now)).toBe("Hace 5 d")
    expect(relativeDay(new Date(2026, 6, 1), now)).toBe("Hace 3 m")
  })
})
