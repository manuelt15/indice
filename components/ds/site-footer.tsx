import { cn } from "cn"
import { Logo } from "@/components/ds/logo"
import { MiniMap } from "@/components/ds/mini-map"
import { cityLabel } from "@/lib/geo"

type FooterPerson = { name?: string | null; city?: string | null; cityCountry?: string | null; cityLat?: number | null; cityLng?: number | null }

/**
 * Pie de página. Con sesión, saluda con el nombre y la ciudad del usuario (solo él lo ve).
 * Sin sesión, muestra Madrid.
 */
function SiteFooter({ person, className }: { person?: FooterPerson; className?: string }) {
  const place = person?.city && person.cityCountry ? cityLabel({ name: person.city, countryCode: person.cityCountry }) : null
  const line = person
    ? [person.name?.trim(), place ? `desde ${place}` : null].filter(Boolean).join(", ")
    : "Hecho en Madrid. Estilo inspirado en mdxcn."
  const hasCity = person?.cityLat != null && person?.cityLng != null
  const center: [number, number] = hasCity ? [person.cityLng!, person.cityLat!] : [-3.7038, 40.4168]
  return (
    <footer className={cn("border-t border-dotted border-border", className)}>
      <div className="mx-auto flex w-full max-w-5xl flex-col items-start justify-between gap-8 px-5 py-8 sm:flex-row">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="font-mono text-xs text-muted-foreground">{line}</p>
        </div>
        <MiniMap center={center} place={hasCity ? place ?? "Tu ciudad" : "Madrid"} enabled={Boolean(process.env.CARTO_BASEMAPS_API_KEY)} />
      </div>
    </footer>
  )
}

export { SiteFooter }
