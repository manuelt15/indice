"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * Favicon de un enlace. Si no hay imagen o falla al cargar, muestra la inicial.
 * Los favicons llegan desde nuestro servidor (nunca desde terceros en el navegador).
 */
function SiteIcon({ src, name, className }: { src?: string | null; name: string; className?: string }) {
  const [failed, setFailed] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)
  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- icono de 16px servido por nuestra API; next/image no aporta nada aquí
      <img
        src={src}
        alt=""
        width={16}
        height={16}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        onLoad={() => setLoaded(true)}
        // Si la imagen ya estaba en caché, onLoad pudo dispararse antes de hidratar.
        ref={(el) => {
          if (el?.complete && el.naturalWidth > 0 && !loaded) setLoaded(true)
        }}
        data-loaded={loaded || undefined}
        // En oscuro, un fondo claro mínimo (solo cuando ya ha cargado) para que los favicons negros no desaparezcan.
        className={cn("size-4 shrink-0 rounded-sm dark:data-loaded:bg-foreground dark:data-loaded:p-px", className)}
      />
    )
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
