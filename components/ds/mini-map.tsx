"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"

const Map = dynamic(() => import("@/components/ui/map").then((module) => module.Map), { ssr: false })

/** El mapa y sus teselas solo se cargan cuando el pie entra en pantalla. */
function MiniMap({ center, place, enabled }: { center: [number, number]; place: string; enabled: boolean }) {
  const frame = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!frame.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    })
    observer.observe(frame.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex w-35 flex-col gap-1.5">
      <div ref={frame} className="relative size-35 overflow-hidden border border-dotted border-border bg-muted">
        {enabled ? (
          <>
            {visible ? <Map center={center} label={`Mapa de ${place}`} /> : null}
            <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="absolute size-3 animate-ping-soft rounded-full bg-primary" />
              <span className="size-2.5 rounded-full border-2 border-background bg-primary" />
            </span>
            <span className="pointer-events-none absolute top-2 left-2 max-w-31 truncate bg-background px-1.5 py-0.5 font-mono text-2xs text-primary">
              {place}
            </span>
          </>
        ) : (
          <p className="flex size-full items-center justify-center text-center font-mono text-2xs text-muted-foreground">Mapa no disponible.</p>
        )}
      </div>
      {enabled ? (
        // Atribución obligatoria de OpenStreetMap y CARTO: debajo, porque dentro de 140px no cabe.
        <p className="font-mono text-2xs text-muted-foreground">
          © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">OpenStreetMap contributors</a>
          {", "}© <a href="https://carto.com/attribution/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">CARTO</a>
        </p>
      ) : null}
    </div>
  )
}

export { MiniMap }
