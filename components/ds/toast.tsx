"use client"

import * as React from "react"
import { cn } from "cn"

export type ToastMessage = { id: number; text: string; tone: "done" | "error" }

/**
 * Aviso breve arriba, bajo la cabecera, en colores invertidos para destacar sin sombra: [ hecho ] o [ error ].
 * Entra bajando y sale subiendo; se desmonta al acabar la salida.
 * La región viva está siempre montada para que los lectores de pantalla anuncien cada aviso.
 */
function Toast({ message, className }: { message: ToastMessage | null; className?: string }) {
  // Conserva el último aviso mientras dura la animación de salida.
  const [shown, setShown] = React.useState(message)
  if (message && message !== shown) setShown(message)
  const closing = !message && shown !== null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("pointer-events-none fixed inset-x-4 top-20 z-50 mx-auto flex max-w-sm justify-center", className)}
    >
      {shown ? (
        <p
          key={shown.id}
          data-slot="toast"
          data-state={closing ? "closed" : "open"}
          onAnimationEnd={() => {
            if (closing) setShown(null)
          }}
          className="flex w-full flex-col gap-1 bg-foreground px-5 py-3.5 text-sm text-background ease-out-quint data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=closed]:duration-150 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-3 data-[state=open]:duration-250"
        >
          <span aria-hidden className="font-mono text-xs tracking-label text-primary-soft">
            [ {shown.tone === "error" ? "error" : "hecho"} ]
          </span>
          {shown.text}
        </p>
      ) : null}
    </div>
  )
}

export { Toast }
