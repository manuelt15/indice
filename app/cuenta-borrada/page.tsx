import type { Metadata } from "next"
import Link from "next/link"
import { Frame } from "@/components/ds/frame"
import { Logo } from "@/components/ds/logo"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Cuenta borrada · índice", robots: { index: false, follow: false } }

export default function CuentaBorradaPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-10 px-5 py-12">
      <Logo />
      <Frame label="cuenta borrada">
        <div className="flex flex-col gap-5">
          <h1 className="text-3xl font-medium tracking-heading">Tu cuenta se ha borrado</h1>
          <p className="text-body">
            Hemos eliminado tu perfil, tus enlaces y tus categorías, y se ha cerrado la sesión. Las copias de seguridad del
            proveedor se sobrescriben en un máximo de 30 días. Gracias por usar índice.
          </p>
          <div className="flex justify-end">
            <Button asChild variant="outline">
              <Link href="/">Ir al inicio</Link>
            </Button>
          </div>
        </div>
      </Frame>
    </main>
  )
}
