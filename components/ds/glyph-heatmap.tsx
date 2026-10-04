"use client"

import { useEffect, useRef } from "react"
import { cn } from "cn"
import { HEAT_GLYPHS, heatLevel } from "@/lib/glyphs"

type HeatWeek = { month?: string; counts: number[] }

const DAY_LABELS = ["L", "", "X", "", "V", "", ""]

/** Mapa de calor con caracteres (·░▒▓█). Una columna por semana, de lunes a domingo. */
function GlyphHeatmap({ weeks, className }: { weeks: HeatWeek[]; className?: string }) {
  const max = Math.max(0, ...weeks.flatMap((w) => w.counts))
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scroller.current) scroller.current.scrollLeft = scroller.current.scrollWidth
  }, [weeks])

  return (
    <div ref={scroller} className={cn("overflow-x-auto overflow-y-hidden pb-1", className)}>
      <div className="flex w-max font-mono text-xs leading-3" role="img" aria-label="Enlaces guardados por día">
        <div aria-hidden className="mr-1.5 flex flex-col">
          <span className="h-5" />
          {DAY_LABELS.map((d, i) => (
            <span key={i} className="h-3.5 text-2xs leading-3.5 text-muted-foreground">
              {d}
            </span>
          ))}
        </div>
        {weeks.map((week, w) => (
          <div key={w} aria-hidden className="flex w-3 flex-col items-center">
            <span className="h-5 w-0 overflow-visible text-2xs whitespace-nowrap text-muted-foreground">{week.month ?? ""}</span>
            {week.counts.map((count, d) => {
              const level = heatLevel(count, max)
              return (
                <span key={d} className={cn("h-3.5 leading-3.5", level > 0 ? "text-primary" : "text-faint")}>
                  {HEAT_GLYPHS[level]}
                </span>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Leyenda del mapa de calor. */
function GlyphHeatmapLegend({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      Menos <span className="tracking-widest text-primary">{HEAT_GLYPHS.join("")}</span> Más
    </span>
  )
}

export { GlyphHeatmap, GlyphHeatmapLegend }
