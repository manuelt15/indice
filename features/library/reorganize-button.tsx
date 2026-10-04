"use client"

import * as React from "react"
import { MagicWandIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { reorganizeAction } from "@/features/library/actions"

/**
 * Reclasifica todos los enlaces por lo que es cada uno. Pide confirmación
 * porque cambia las categorías actuales (las carpetas antiguas se guardan como tags).
 */
export function ReorganizeButton() {
  const router = useRouter()
  const [confirming, setConfirming] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()

  function run() {
    startTransition(async () => {
      const result = await reorganizeAction()
      setConfirming(false)
      if (!result.ok) {
        setMessage(result.error)
        return
      }
      const { moved, unclassified } = result.summary
      setMessage(
        moved === 0
          ? "Todo estaba ya en su sitio."
          : `${moved} ${moved === 1 ? "enlace cambiado" : "enlaces cambiados"} de categoría.${unclassified ? ` ${unclassified} sin pistas suficientes, se quedan como estaban.` : ""}`
      )
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {confirming ? (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-body">Se reclasifican todos tus enlaces. Tus carpetas antiguas se guardan como tags.</p>
          <Button size="sm" disabled={pending} onClick={run}>
            {pending ? "Reorganizando…" : "Sí, reorganizar"}
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => setConfirming(false)}>
            Cancelar
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setMessage(null)
            setConfirming(true)
          }}
        >
          <MagicWandIcon />
          Reorganizar automáticamente
        </Button>
      )}
      {message ? (
        <p role="status" className="font-mono text-2xs text-muted-foreground">
          {message}
        </p>
      ) : null}
    </div>
  )
}
