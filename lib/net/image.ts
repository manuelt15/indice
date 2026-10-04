export type IconType = "image/png" | "image/x-icon" | "image/gif" | "image/jpeg" | "image/webp" | "image/svg+xml"

/**
 * Detecta el tipo real por los primeros bytes, sin fiarse del Content-Type del servidor.
 * SVG se acepta porque solo se muestra en <img> (no ejecuta scripts) y la ruta que lo sirve
 * envía una CSP con sandbox, que los bloquea también si alguien abre la URL directamente.
 */
export function sniffIconType(bytes: Uint8Array): IconType | null {
  const b = bytes
  if (b.length < 4) return null
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png"
  if (b[0] === 0x00 && b[1] === 0x00 && (b[2] === 0x01 || b[2] === 0x02) && b[3] === 0x00) return "image/x-icon"
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return "image/gif"
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg"
  if (b.length >= 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50)
    return "image/webp"
  const head = new TextDecoder().decode(b.subarray(0, 1024)).replace(/^\uFEFF/, "").trimStart().toLowerCase()
  if (head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"))) return "image/svg+xml"
  return null
}
