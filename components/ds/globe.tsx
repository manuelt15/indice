import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const globeVariants = cva("shrink-0 text-primary", {
  variants: {
    size: {
      sm: "size-4",
      md: "size-5",
      lg: "size-8",
      xl: "size-16",
    },
  },
  defaultVariants: { size: "md" },
})

/** Marca de índice: un globo de líneas finas, inclinado. */
function Globe({ size, className, ...props }: React.ComponentProps<"svg"> & VariantProps<typeof globeVariants>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      data-slot="globe"
      className={cn(globeVariants({ size }), className)}
      {...props}
    >
      <g transform="rotate(-24 16 16)" stroke="currentColor" strokeWidth={0.7}>
        <circle cx="16" cy="16" r="14.5" />
        <ellipse cx="16" cy="16" rx="11" ry="14.5" />
        <ellipse cx="16" cy="16" rx="6.5" ry="14.5" />
        <ellipse cx="16" cy="16" rx="2" ry="14.5" />
        <path d="M1.5 16h29M3.4 9h25.2M3.4 23h25.2M7.6 4h16.8M7.6 28h16.8" />
      </g>
    </svg>
  )
}

export { Globe, globeVariants }
