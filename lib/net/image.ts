export type IconType = "image/png" | "image/x-icon" | "image/gif" | "image/jpeg" | "image/webp"

/**
 * Detecta el tipo real por los primeros bytes. Solo formatos de mapa de bits:
 * SVG queda fuera porque puede llevar scripts.
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
  return null
}
