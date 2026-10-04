"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Label as LabelPrimitive } from "radix-ui"

const labelVariants = cva(
  "flex items-center gap-2 select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-45",
  {
    variants: {
      variant: {
        /** Etiqueta de campo, en mono y discreta. */
        field: "font-mono text-2xs text-muted-foreground",
        /** Texto que acompaña a una casilla o un interruptor. */
        inline: "text-sm leading-snug text-body",
      },
    },
    defaultVariants: { variant: "field" },
  }
)

function Label({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(labelVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Label, labelVariants }
