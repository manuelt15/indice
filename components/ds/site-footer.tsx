import { cn } from "cn"
import { Logo } from "@/components/ds/logo"
import { cityLabel } from "@/lib/geo"

type FooterPerson = { name?: string | null; city?: string | null; cityCountry?: string | null }

/**
 * Pie de página. Con sesión, saluda con el nombre y la ciudad del usuario (solo él lo ve).
 * Sin sesión, muestra el origen del proyecto. El mapa llega en la fase 8.
 */
function SiteFooter({ person, className }: { person?: FooterPerson; className?: string }) {
  const place = person?.city && person.cityCountry ? cityLabel({ name: person.city, countryCode: person.cityCountry }) : null
  const line = person
    ? [person.name?.trim(), place ? `desde ${place}` : null].filter(Boolean).join(", ")
    : "Hecho en Madrid. Estilo inspirado en mdxcn."
  return (
    <footer className={cn("border-t border-dotted border-border", className)}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-5 py-7">
        <Logo />
        <p className="font-mono text-xs text-muted-foreground">{line}</p>
      </div>
    </footer>
  )
}

export { SiteFooter }
