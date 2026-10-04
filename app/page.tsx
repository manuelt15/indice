import Link from "next/link"
import { Logo } from "@/components/ds/logo"
import { ThemeToggle } from "@/components/ds/theme-toggle"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-start justify-center gap-6 px-5 py-16">
      <div className="flex w-full items-center justify-between">
        <Logo />
        <ThemeToggle />
      </div>
      <h1 className="text-display font-medium tracking-display text-balance">En construcción</h1>
      <p className="max-w-xl text-muted-foreground">
        El sistema de diseño ya está listo. La landing llega en la fase 8.
      </p>
      <Button asChild variant="outline">
        <Link href="/kit">Ver el kit del sistema</Link>
      </Button>
    </main>
  )
}
