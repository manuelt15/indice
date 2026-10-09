import { cn } from "cn"

export type ToastMessage = { id: number; text: string; tone: "done" | "error" }

/**
 * Aviso breve abajo, con el aspecto de un marco: [ hecho ] o [ error ].
 * La región viva está siempre montada para que los lectores de pantalla anuncien cada aviso.
 */
function Toast({ message, className }: { message: ToastMessage | null; className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("pointer-events-none fixed inset-x-4 bottom-6 z-50 mx-auto flex max-w-sm justify-center", className)}
    >
      {message ? (
        <p
          key={message.id}
          data-slot="toast"
          className="relative w-full border border-dotted border-border bg-background px-5 pt-5 pb-4 text-sm text-foreground duration-150 ease-out-quint animate-in fade-in-0 slide-in-from-bottom-2"
        >
          <span aria-hidden className="absolute inset-x-5 -top-2.5 flex">
            <span
              className={cn(
                "truncate bg-background px-2 font-mono text-xs tracking-label",
                message.tone === "error" ? "text-destructive" : "text-primary"
              )}
            >
              [ {message.tone === "error" ? "error" : "hecho"} ]
            </span>
          </span>
          {message.text}
        </p>
      ) : null}
    </div>
  )
}

export { Toast }
