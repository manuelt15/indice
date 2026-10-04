"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, EnvelopeClosedIcon, ReloadIcon } from "@radix-ui/react-icons"
import { GitHubLogo, GoogleLogo } from "@/components/ds/brand-icons"
import { Frame } from "@/components/ds/frame"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"

type Step = { kind: "start" } | { kind: "code"; email: string }

const AFTER_SIGN_IN = "/app"

function messageFor(code: string | undefined): string {
  switch (code) {
    case "INVALID_OTP":
      return "El código no es correcto. Revísalo e inténtalo de nuevo."
    case "OTP_EXPIRED":
      return "El código ha caducado. Pide uno nuevo."
    case "TOO_MANY_ATTEMPTS":
      return "Demasiados intentos con este código. Pide uno nuevo."
    case "TOO_MANY_REQUESTS":
      return "Has pedido demasiados códigos. Espera unos minutos y vuelve a intentarlo."
    default:
      return "No hemos podido completar el acceso. Inténtalo de nuevo en un momento."
  }
}

export function SignInForm() {
  const router = useRouter()
  const [step, setStep] = React.useState<Step>({ kind: "start" })
  const [email, setEmail] = React.useState("")
  const [code, setCode] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  async function social(provider: "google" | "github") {
    setPending(true)
    setError(null)
    const { error } = await authClient.signIn.social({ provider, callbackURL: AFTER_SIGN_IN })
    if (error) {
      setError(messageFor(error.code))
      setPending(false)
    }
  }

  async function sendCode(event: React.FormEvent) {
    event.preventDefault()
    const target = email.trim().toLowerCase()
    if (!target) {
      setError("Escribe tu correo.")
      return
    }
    setPending(true)
    setError(null)
    const { error } = await authClient.emailOtp.sendVerificationOtp({ email: target, type: "sign-in" })
    setPending(false)
    if (error) {
      setError(messageFor(error.code))
      return
    }
    setCode("")
    setStep({ kind: "code", email: target })
  }

  async function verify(event: React.FormEvent) {
    event.preventDefault()
    if (step.kind !== "code") return
    setPending(true)
    setError(null)
    const { error } = await authClient.signIn.emailOtp({ email: step.email, otp: code })
    if (error) {
      setError(messageFor(error.code))
      setPending(false)
      return
    }
    router.push(AFTER_SIGN_IN)
    router.refresh()
  }

  if (step.kind === "code") {
    return (
      <Frame label="revisa tu correo">
        <form onSubmit={verify} className="flex flex-col gap-4">
          <h1 className="text-2xl font-medium tracking-heading">Escribe tu código</h1>
          <p className="text-sm text-body">
            Hemos enviado un código de 6 dígitos a <span className="font-mono text-foreground">{step.email}</span>.
            Caduca en 10 minutos y tienes 5 intentos.
          </p>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="otp">Código</Label>
            <Input
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={pending || code.length !== 6}>
            Entrar
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setStep({ kind: "start" })}>
              <ArrowLeftIcon />
              Cambiar correo
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={pending} onClick={sendCode}>
              <ReloadIcon />
              Reenviar código
            </Button>
          </div>
        </form>
      </Frame>
    )
  }

  return (
    <Frame label="entrar">
      <div className="flex flex-col gap-3">
        <h1 className="pb-2 text-2xl font-medium tracking-heading">Entra en tu índice</h1>
        <Button type="button" variant="outline" disabled={pending} onClick={() => social("google")}>
          <GoogleLogo />
          Continuar con Google
        </Button>
        <Button type="button" variant="outline" disabled={pending} onClick={() => social("github")}>
          <GitHubLogo />
          Continuar con GitHub
        </Button>

        <div aria-hidden className="my-1 flex items-center gap-2.5 font-mono text-2xs text-muted-foreground">
          <span className="flex-1 border-t border-dotted border-border" />O con tu correo
          <span className="flex-1 border-t border-dotted border-border" />
        </div>

        <form onSubmit={sendCode} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={pending}>
            <EnvelopeClosedIcon />
            Enviarme un código
          </Button>
        </form>

        <p className="font-mono text-2xs text-muted-foreground">Sin contraseñas. Te llega un código de 6 dígitos.</p>

        <p className="text-sm leading-snug text-body">
          Al continuar confirmas que tienes 14 años o más y aceptas los{" "}
          <Link href="/terminos" className="underline hover:text-primary">términos</Link> y la{" "}
          <Link href="/privacidad" className="underline hover:text-primary">política de privacidad</Link>.
        </p>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </Frame>
  )
}
