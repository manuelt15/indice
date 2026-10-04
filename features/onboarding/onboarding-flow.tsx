"use client"

import * as React from "react"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookmarkIcon,
  Cross2Icon,
  InfoCircledIcon,
  Link2Icon,
  LockClosedIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons"
import { Frame } from "@/components/ds/frame"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { completeOnboardingAction, searchCitiesAction } from "@/features/onboarding/actions"
import { cityLabel, type CityOption } from "@/lib/geo"

const POINTS = [
  { Icon: Link2Icon, text: "Guarda enlaces pegando una URL o importando los de Chrome." },
  { Icon: BookmarkIcon, text: "Se ordenan por categoría y tags; tú revisas antes de guardar." },
  { Icon: MagnifyingGlassIcon, text: "Encuentra cualquiera con ⌘K, por nombre, tag o dominio." },
  { Icon: LockClosedIcon, text: "Son solo tuyos: nadie más ve tus enlaces." },
]

function Steps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <p className="font-mono text-2xs text-muted-foreground">
      <span className="text-primary">{current}</span>/3
    </p>
  )
}

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

export function OnboardingFlow({ initialName }: { initialName: string }) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1)
  const [name, setName] = React.useState(initialName)
  const [cityQuery, setCityQuery] = React.useState("")
  const [city, setCity] = React.useState<CityOption | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()
  const { results, loading } = useCitySearch(cityQuery, city === null)

  function goToStep3(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      setError("Escribe tu nombre.")
      return
    }
    setError(null)
    setStep(3)
  }

  function finish() {
    setError(null)
    startTransition(async () => {
      const result = await completeOnboardingAction({ name, city })
      if (result && !result.ok) setError(result.error)
    })
  }

  if (step === 1) {
    return (
      <Frame label="bienvenida">
        <div className="flex flex-col gap-5">
          <Steps current={1} />
          <h1 className="text-3xl font-medium tracking-heading text-balance">Te damos la bienvenida a índice</h1>
          <ul className="flex flex-col gap-2.5">
            {POINTS.map(({ Icon, text }) => (
              <li key={text} className="flex gap-3 text-body">
                <Icon aria-hidden className="mt-1 shrink-0 text-primary" />
                {text}
              </li>
            ))}
          </ul>
          <div className="flex justify-end">
            <Button type="button" onClick={() => setStep(2)}>
              Empezar
              <ArrowRightIcon />
            </Button>
          </div>
        </div>
      </Frame>
    )
  }

  if (step === 2) {
    return (
      <Frame label="sobre ti">
        <form onSubmit={goToStep3} className="flex flex-col gap-5">
          <Steps current={2} />
          <h1 className="text-3xl font-medium tracking-heading">¿Cómo te llamamos?</h1>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" autoComplete="given-name" maxLength={40} required value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="city">Ciudad · Opcional</Label>
            {city ? (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-dotted border-border px-3 py-2 text-sm">
                <span>{cityLabel(city)}</span>
                <Button type="button" size="sm" variant="ghost" onClick={() => setCity(null)}>
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
                  aria-describedby="city-help"
                />
                {results.length > 0 ? (
                  <ul aria-label="Ciudades sugeridas" className="flex flex-wrap gap-1.5">
                    {results.map((option) => (
                      <li key={`${option.name}-${option.countryCode}-${option.lat}`}>
                        <Button type="button" size="sm" variant="outline" onClick={() => setCity(option)}>
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

          <p id="city-help" className="flex gap-2.5 rounded-lg border border-dotted border-border p-3 text-sm text-body">
            <InfoCircledIcon aria-hidden className="mt-0.5 shrink-0 text-primary" />
            Solo pedimos la ciudad, nunca tu ubicación exacta ni acceso al GPS. La usamos para el mapa del pie de página, que
            solo ves tú. Puedes cambiarla o borrarla cuando quieras.
          </p>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="flex justify-between gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              <ArrowLeftIcon />
              Atrás
            </Button>
            <Button type="submit">
              Continuar
              <ArrowRightIcon />
            </Button>
          </div>
        </form>
      </Frame>
    )
  }

  return (
    <Frame label="tus enlaces">
      <div className="flex flex-col gap-5">
        <Steps current={3} />
        <h1 className="text-3xl font-medium tracking-heading text-balance">Todo listo, {name.trim()}</h1>
        <p className="text-body">
          Podrás traer tus marcadores de Chrome en cuanto esté lista la importación. Mientras tanto, puedes empezar con tu
          índice vacío y añadir enlaces a mano.
        </p>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <div className="flex justify-between gap-3">
          <Button type="button" variant="outline" onClick={() => setStep(2)} disabled={pending}>
            <ArrowLeftIcon />
            Atrás
          </Button>
          <Button type="button" onClick={finish} disabled={pending}>
            Empezar mi índice
            <ArrowRightIcon />
          </Button>
        </div>
      </div>
    </Frame>
  )
}
