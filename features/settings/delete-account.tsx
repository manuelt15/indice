"use client"

import * as React from "react"
import { TrashIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { deleteAccountAction } from "@/features/settings/actions"

/** Borrar la cuenta: solo se activa al escribir «borrar». No hay papelera ni vuelta atrás. */
export function DeleteAccount({ linkCount }: { linkCount: number }) {
  const [confirmation, setConfirmation] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()
  const ready = confirmation.trim().toLowerCase() === "borrar"

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!ready) return
    setError(null)
    startTransition(async () => {
      const result = await deleteAccountAction(confirmation)
      if (result && !result.ok) setError(result.error)
    })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-body">
        {linkCount === 0
          ? "Se borrarán al momento tu cuenta y tu perfil. No se puede deshacer."
          : `Se borrarán al momento tu cuenta, tu perfil y ${linkCount === 1 ? "tu enlace" : `tus ${linkCount} enlaces`} con sus categorías. No se puede deshacer: si quieres conservarlos, descárgalos antes.`}
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirm-delete">Escribe «borrar» para confirmar</Label>
        <Input id="confirm-delete" autoComplete="off" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div className="flex justify-end">
        <Button type="submit" variant="destructive" disabled={!ready || pending}>
          <TrashIcon />
          Borrar mi cuenta y todos mis datos
        </Button>
      </div>
    </form>
  )
}
