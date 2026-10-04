const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** Lunes de la semana de la fecha (semanas de lunes a domingo). */
function mondayOf(date: Date): Date {
  const d = startOfDay(date)
  const offset = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - offset)
  return d
}

export type HeatWeek = { month?: string; counts: number[] }

/** Guardados por día en las últimas `weeks` semanas, de lunes a domingo. La última semana es la actual. */
export function heatWeeks(dates: Date[], now: Date, weeks = 26): HeatWeek[] {
  const start = mondayOf(now)
  start.setDate(start.getDate() - (weeks - 1) * 7)
  const result: HeatWeek[] = Array.from({ length: weeks }, () => ({ counts: [0, 0, 0, 0, 0, 0, 0] }))
  for (const date of dates) {
    const day = startOfDay(date)
    const diff = Math.round((day.getTime() - start.getTime()) / 86_400_000)
    if (diff < 0 || diff >= weeks * 7) continue
    result[Math.floor(diff / 7)].counts[diff % 7] += 1
  }
  let lastMonth = -1
  result.forEach((week, i) => {
    const monday = new Date(start)
    monday.setDate(start.getDate() + i * 7)
    if (monday.getMonth() !== lastMonth) {
      week.month = MONTHS[monday.getMonth()]
      lastMonth = monday.getMonth()
    }
  })
  return result
}

/** "Hoy", "Ayer", "Hace 5 d", "Hace 3 m". */
export function relativeDay(date: Date, now: Date): string {
  const days = Math.round((startOfDay(now).getTime() - startOfDay(date).getTime()) / 86_400_000)
  if (days <= 0) return "Hoy"
  if (days === 1) return "Ayer"
  if (days < 30) return `Hace ${days} d`
  if (days < 365) return `Hace ${Math.round(days / 30)} m`
  return `Hace ${Math.round(days / 365)} a`
}
