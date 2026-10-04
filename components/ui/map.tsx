"use client"

import { useEffect, useRef } from "react"
import * as maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

const styles = {
  light: "/api/map/style/positron-gl-style/style.json?v=1",
  dark: "/api/map/style/dark-matter-gl-style/style.json?v=1",
}

/** Mapa base de CARTO, adaptado del componente Map de mapcn a los usos de índice. */
function Map({ center, label }: { center: [number, number]; label: string }) {
  const container = useRef<HTMLDivElement>(null)
  const [lng, lat] = center

  useEffect(() => {
    if (!container.current) return
    maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs")
    const dark = () => document.documentElement.classList.contains("dark")
    const map = new maplibregl.Map({
      container: container.current,
      style: dark() ? styles.dark : styles.light,
      center: [lng, lat],
      zoom: 11,
      interactive: false,
      attributionControl: false,
      renderWorldCopies: false,
    })
    const observer = new MutationObserver(() => map.setStyle(dark() ? styles.dark : styles.light))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => {
      observer.disconnect()
      map.remove()
    }
  }, [lng, lat])

  return <div ref={container} className="size-full" role="img" aria-label={label} />
}

export { Map }
