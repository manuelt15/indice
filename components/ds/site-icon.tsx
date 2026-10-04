import Image from "next/image"
import { cn } from "cn"

/**
 * Favicon de un enlace. Sin imagen, muestra la inicial.
 * Los favicons llegan desde nuestro servidor (nunca desde terceros en el navegador).
 */
function SiteIcon({ src, name, className }: { src?: string | null; name: string; className?: string }) {
  if (src) {
    return <Image src={src} alt="" width={16} height={16} unoptimized className={cn("size-4 shrink-0 rounded-sm", className)} />
  }
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center rounded-sm bg-secondary font-mono text-2xs leading-none text-muted-foreground uppercase",
        className
      )}
    >
      {name.trim().charAt(0) || "·"}
    </span>
  )
}

export { SiteIcon }
