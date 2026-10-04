import Link from "next/link"
import { cn } from "cn"
import { Globe } from "@/components/ds/globe"

/** Logo completo: globo + "índice". Lleva a la portada. */
function Logo({ className, ...props }: Omit<React.ComponentProps<typeof Link>, "href">) {
  return (
    <Link
      href="/"
      aria-label="índice, ir al inicio"
      className={cn("group inline-flex items-center gap-2 text-base font-medium tracking-tight text-foreground", className)}
      {...props}
    >
      <Globe className="transition-transform duration-500 ease-out-quint group-hover:-rotate-30" />
      índice
    </Link>
  )
}

export { Logo }
