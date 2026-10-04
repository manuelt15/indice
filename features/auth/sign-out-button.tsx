"use client"

import { useRouter } from "next/navigation"
import { ExitIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export function SignOutButton() {
  const router = useRouter()
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      aria-label="Cerrar sesión"
      title="Cerrar sesión"
      onClick={async () => {
        await authClient.signOut()
        router.push("/entrar")
        router.refresh()
      }}
    >
      <ExitIcon />
    </Button>
  )
}
