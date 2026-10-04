import { cn } from "cn"

function Cross({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute bg-background font-mono text-xs leading-none text-muted-foreground", className)}
    >
      +
    </span>
  )
}

/**
 * Marco punteado con cruces en las esquinas y etiqueta en mono: [ etiqueta ].
 * Es la unidad de agrupación del sistema.
 */
function Frame({
  label,
  className,
  children,
  ...props
}: React.ComponentProps<"section"> & { label?: string }) {
  return (
    <section
      data-slot="frame"
      className={cn("relative min-w-0 border border-dotted border-border bg-card px-6 pt-8 pb-6", className)}
      {...props}
    >
      {label ? (
        <span className="absolute inset-x-6 -top-2.5 flex">
          <span className="truncate bg-background px-2 font-mono text-xs tracking-label text-primary">[ {label} ]</span>
        </span>
      ) : null}
      <Cross className="-top-2 -left-1" />
      <Cross className="-top-2 -right-1" />
      <Cross className="-bottom-1.5 -left-1" />
      <Cross className="-right-1 -bottom-1.5" />
      {children}
    </section>
  )
}

/** Pie de un marco: metadatos en mono a los dos extremos. */
function FrameFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="frame-footer"
      className={cn("mt-4 flex flex-wrap justify-between gap-3 font-mono text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

export { Frame, FrameFooter }
