"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRightIcon } from "@radix-ui/react-icons"
import { Frame } from "@/components/ds/frame"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { acceptTermsAction } from "@/features/onboarding/actions"

/** Para cuentas creadas antes de que existieran los términos: los aceptan una vez. */
export function AcceptTerms() {
  const [accepted, setAccepted] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()

  function submit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await acceptTermsAction(accepted)
      if (result && !result.ok) setError(result.error)
    })
  }

  return (
    <Frame label="términos">
      <form onSubmit={submit} className="flex flex-col gap-5">
        <h1 className="text-3xl font-medium tracking-heading text-balance">Hemos publicado los términos y la privacidad</h1>
        <p className="text-body">
          Explican qué guardamos, para qué y cómo exportar o borrar tus datos. Nada cambia en tus enlaces: solo necesitamos que
          los aceptes una vez.
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
        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            Continuar
            <ArrowRightIcon />
          </Button>
        </div>
      </form>
    </Frame>
  )
}
