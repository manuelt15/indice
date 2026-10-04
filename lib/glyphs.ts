export const HEAT_GLYPHS = ["·", "░", "▒", "▓", "█"] as const;

/** Barra de texto proporcional: "█████░░░░░". */
export function glyphBar(value: number, max: number, width = 20): { filled: string; empty: string } {
  const safeWidth = Math.max(1, Math.floor(width));
  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
  const filled = Math.round(ratio * safeWidth);
  return { filled: "█".repeat(filled), empty: "░".repeat(safeWidth - filled) };
}

/** Nivel 0–4 de una celda del mapa de calor, relativo al máximo. */
export function heatLevel(count: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0 || max <= 0) return 0;
  const ratio = count / max;
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
}
