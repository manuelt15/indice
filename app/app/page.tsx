import type { Metadata } from "next"
import { Frame } from "@/components/ds/frame"
import { Logo } from "@/components/ds/logo"
import { ThemeToggle } from "@/components/ds/theme-toggle"
import { SignOutButton } from "@/features/auth/sign-out-button"
import { requireUser } from "@/lib/session"

export const metadata: Metadata = { title: "Tu índice", robots: { index: false, follow: false } }

export default async function AppPage() {
  const user = await requireUser()
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-5 py-12">
      <div className="flex items-center justify-between gap-4">
        <Logo />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <SignOutButton />
        </div>
      </div>
      <h1 className="text-display font-medium tracking-display text-balance">Hola, {user.name || "de nuevo"}</h1>
      <Frame label="sesión">
        <p className="text-sm text-body">
          Has entrado como <span className="font-mono text-foreground">{user.email}</span>. La biblioteca llega en la fase 5.
        </p>
      </Frame>
    </main>
  )
}
