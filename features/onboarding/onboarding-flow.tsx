"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookmarkIcon,
  InfoCircledIcon,
  Link2Icon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  UploadIcon,
} from "@radix-ui/react-icons"
import { Frame } from "@/components/ds/frame"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { completeOnboardingAction } from "@/features/onboarding/actions"
import { CityField } from "@/features/onboarding/city-field"
import type { CityOption } from "@/lib/geo"

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

export function OnboardingFlow({ initialName }: { initialName: string }) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1)
  const [name, setName] = React.useState(initialName)
  const [city, setCity] = React.useState<CityOption | null>(null)
  const [accepted, setAccepted] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()

  function goToStep3(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      setError("Escribe tu nombre.")
      return
    }
    if (!accepted) {
      setError("Para continuar, confirma que tienes 14 años o más y aceptas los términos.")
      return
    }
    setError(null)
    setStep(3)
  }

  function finish(next: "app" | "importar") {
    setError(null)
    startTransition(async () => {
      const result = await completeOnboardingAction({ name, city, acceptTerms: true }, next)
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

          <CityField city={city} onChange={setCity} describedBy="city-help" />

          <p id="city-help" className="flex gap-2.5 rounded-lg border border-dotted border-border p-3 text-sm text-body">
            <InfoCircledIcon aria-hidden className="mt-0.5 shrink-0 text-primary" />
            Solo pedimos la ciudad, nunca tu ubicación exacta ni acceso al GPS. La usamos para el mapa del pie de página, que
            solo ves tú. Puedes cambiarla o borrarla cuando quieras.
          </p>

          <div className="flex items-start gap-2.5">
            <Checkbox id="terms" checked={accepted} onCheckedChange={(v) => setAccepted(v === true)} />
            <Label htmlFor="terms" variant="inline" className="block">
              Tengo 14 años o más y acepto los{" "}
              <Link href="/terminos" target="_blank" className="underline hover:text-primary">términos</Link> y la{" "}
              <Link href="/privacidad" target="_blank" className="underline hover:text-primary">política de privacidad</Link>.
            </Label>
          </div>

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
          Trae tus marcadores de Chrome en un momento: cada enlace se clasifica según lo que es, tus carpetas se guardan como
          tags y se conservan las fechas. O empieza con tu índice vacío y añade enlaces a mano.
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
          <div className="flex flex-wrap justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => finish("app")} disabled={pending}>
              Empezar vacío
            </Button>
            <Button type="button" onClick={() => finish("importar")} disabled={pending}>
              <UploadIcon />
              Importar de Chrome
            </Button>
          </div>
        </div>
      </div>
    </Frame>
  )
}
