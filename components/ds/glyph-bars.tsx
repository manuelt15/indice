import { cn } from "cn"
import { glyphBar } from "@/lib/glyphs"

type GlyphBarRow = { label: string; value: number }

/** Barras horizontales hechas con caracteres: "UI ████████░░░░ 13". */
function GlyphBars({ rows, width = 20, className }: { rows: GlyphBarRow[]; width?: number; className?: string }) {
  const max = Math.max(0, ...rows.map((r) => r.value))
  return (
    <ul className={cn("flex flex-col gap-1.5", className)}>
      {rows.map((row) => {
        const bar = glyphBar(row.value, max, width)
        return (
          <li key={row.label} className="flex items-center gap-3.5 text-sm">
            <span className="w-24 shrink-0 truncate text-foreground">{row.label}</span>
            <span aria-hidden className="min-w-0 flex-1 overflow-hidden font-mono text-xs whitespace-nowrap text-body">
              {bar.filled}
              <span className="text-faint">{bar.empty}</span>
            </span>
            <span className="w-8 shrink-0 text-right font-mono text-primary tabular-nums">{row.value}</span>
          </li>
        )
      })}
    </ul>
  )
}

export { GlyphBars }
