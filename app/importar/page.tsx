import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "@radix-ui/react-icons"
import { Logo } from "@/components/ds/logo"
import { ThemeToggle } from "@/components/ds/theme-toggle"
import { Button } from "@/components/ui/button"
import { ImportFlow } from "@/features/import/import-flow"
import { requireOnboardedUser } from "@/lib/session"

export const metadata: Metadata = { title: "Importar · índice", robots: { index: false, follow: false } }

export default async function ImportarPage() {
  await requireOnboardedUser()
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-5 py-12">
      <div className="flex items-center justify-between">
        <Logo />
        <ThemeToggle />
      </div>
      <div className="flex flex-col items-start gap-3">
        <Button asChild size="sm" variant="ghost">
          <Link href="/app">
            <ArrowLeftIcon />
            Volver a mi índice
          </Link>
        </Button>
        <h1 className="text-3xl font-medium tracking-heading">Importar tus marcadores</h1>
      </div>
      <ImportFlow />
    </main>
  )
}
