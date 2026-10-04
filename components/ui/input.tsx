import * as React from "react"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border border-dotted border-input bg-background px-3 text-sm text-foreground transition-colors duration-150 outline-none placeholder:text-muted-foreground focus-visible:border-solid focus-visible:border-primary disabled:pointer-events-none disabled:opacity-45 aria-invalid:border-solid aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
