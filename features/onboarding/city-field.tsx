"use client"

import * as React from "react"
import { Cross2Icon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { searchCitiesAction } from "@/features/onboarding/actions"
import { cityLabel, type CityOption } from "@/lib/geo"

function useCitySearch(query: string, enabled: boolean) {
  const [results, setResults] = React.useState<CityOption[]>([])
  const [loading, setLoading] = React.useState(false)
  React.useEffect(() => {
    const q = query.trim()
    if (!enabled || q.length < 2) return
    let cancelled = false
    const timer = setTimeout(async () => {
      setLoading(true)
      const found = await searchCitiesAction(q).catch(() => [])
      if (!cancelled) {
        setResults(found)
        setLoading(false)
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, enabled])
  return { results: enabled && query.trim().length >= 2 ? results : [], loading }
}

/** Ciudad opcional elegida entre sugerencias (nunca texto libre ni ubicación exacta). Bienvenida y Ajustes. */
export function CityField({
  city,
  onChange,
  describedBy,
}: {
  city: CityOption | null
  onChange: (city: CityOption | null) => void
  describedBy?: string
}) {
  const [cityQuery, setCityQuery] = React.useState("")
  const { results, loading } = useCitySearch(cityQuery, city === null)
  return (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">Ciudad · Opcional</Label>
          {city ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-dotted border-border px-3 py-2 text-sm">
              <span>{cityLabel(city)}</span>
              <Button type="button" size="sm" variant="ghost" onClick={() => onChange(null)}>
                <Cross2Icon />
                Quitar
              </Button>
            </div>
          ) : (
            <>
              <Input
                id="city"
                autoComplete="off"
                placeholder="Busca tu ciudad, por ejemplo Madrid"
                maxLength={60}
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                aria-describedby={describedBy}
              />
              {results.length > 0 ? (
                <ul aria-label="Ciudades sugeridas" className="flex flex-wrap gap-1.5">
                  {results.map((option) => (
                    <li key={`${option.name}-${option.countryCode}-${option.lat}`}>
                      <Button type="button" size="sm" variant="outline" onClick={() => onChange(option)}>
                        {cityLabel(option)}
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : cityQuery.trim().length >= 2 && !loading ? (
                <p className="font-mono text-2xs text-muted-foreground">Sin resultados. Prueba con otro nombre.</p>
              ) : null}
            </>
          )}
        </div>
  )
}
