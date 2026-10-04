import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Logo } from "@/components/ds/logo"
import { ThemeToggle } from "@/components/ds/theme-toggle"
import { OnboardingFlow } from "@/features/onboarding/onboarding-flow"
import { requireUser } from "@/lib/session"

export const metadata: Metadata = { title: "Bienvenida · índice", robots: { index: false, follow: false } }

export default async function BienvenidaPage() {
  const user = await requireUser()
  if (user.onboardedAt) redirect("/app")
  const firstName = (user.name ?? "").trim().split(/\s+/)[0] ?? ""
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-10 px-5 py-12">
      <div className="flex items-center justify-between">
        <Logo />
        <ThemeToggle />
      </div>
      <OnboardingFlow initialName={firstName} />
    </main>
  )
}
