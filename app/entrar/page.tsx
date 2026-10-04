import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Logo } from "@/components/ds/logo"
import { ThemeToggle } from "@/components/ds/theme-toggle"
import { SignInForm } from "@/features/auth/sign-in-form"
import { emailCodesEnabled } from "@/lib/auth"
import { getSession } from "@/lib/session"

export const metadata: Metadata = { title: "Entrar · índice" }

export default async function EntrarPage() {
  if (await getSession()) redirect("/app") // /app manda a /bienvenida si aún no la ha hecho
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-10 px-5 py-12">
      <div className="flex items-center justify-between">
        <Logo />
        <ThemeToggle />
      </div>
      <SignInForm emailCodes={emailCodesEnabled} />
      <p className="font-mono text-2xs text-muted-foreground">Sin cookies de seguimiento. Solo una cookie técnica para tu sesión.</p>
    </main>
  )
}
