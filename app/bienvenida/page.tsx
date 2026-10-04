import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Frame } from "@/components/ds/frame"
import { Logo } from "@/components/ds/logo"
import { ThemeToggle } from "@/components/ds/theme-toggle"
import { db } from "@/db"
import { AcceptTerms } from "@/features/onboarding/accept-terms"
import { OnboardingFlow } from "@/features/onboarding/onboarding-flow"
import { DeleteAccount } from "@/features/settings/delete-account"
import { linksRepo } from "@/lib/dal/links"
import { requireUser } from "@/lib/session"

export const metadata: Metadata = { title: "Bienvenida · índice", robots: { index: false, follow: false } }

export default async function BienvenidaPage() {
  const user = await requireUser()
  if (user.onboardedAt && user.termsAcceptedAt) redirect("/app")
  const linkCount = user.onboardedAt ? (await linksRepo(db).list(user.id)).length : 0
  const firstName = (user.name ?? "").trim().split(/\s+/)[0] ?? ""
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-10 px-5 py-12">
      <div className="flex items-center justify-between">
        <Logo />
        <ThemeToggle />
      </div>
      {user.onboardedAt ? <AcceptTerms /> : <OnboardingFlow initialName={firstName} />}
      <details className="group">
        <summary className="cursor-pointer font-mono text-xs text-muted-foreground hover:text-foreground">
          ¿No quieres continuar? Borra tu cuenta.
        </summary>
        <Frame label="borrar cuenta" className="mt-4">
          <DeleteAccount linkCount={linkCount} />
        </Frame>
      </details>
    </main>
  )
}
