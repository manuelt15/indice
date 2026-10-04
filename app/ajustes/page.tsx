import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon, DownloadIcon } from "@radix-ui/react-icons"
import { Frame } from "@/components/ds/frame"
import { Logo } from "@/components/ds/logo"
import { SiteFooter } from "@/components/ds/site-footer"
import { ThemeToggle } from "@/components/ds/theme-toggle"
import { Button } from "@/components/ui/button"
import { db } from "@/db"
import { SignOutButton } from "@/features/auth/sign-out-button"
import { DeleteAccount } from "@/features/settings/delete-account"
import { ProfileForm } from "@/features/settings/profile-form"
import { linksRepo } from "@/lib/dal/links"
import { requireOnboardedUser } from "@/lib/session"

export const metadata: Metadata = { title: "Ajustes · índice", robots: { index: false, follow: false } }

export default async function AjustesPage() {
  const user = await requireOnboardedUser()
  const links = await linksRepo(db).list(user.id)
  const city =
    user.city && user.cityCountry && user.cityLat != null && user.cityLng != null
      ? { name: user.city, countryCode: user.cityCountry, lat: user.cityLat, lng: user.cityLng }
      : null

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-dotted border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-13 max-w-5xl items-center gap-3 px-5">
          <Logo />
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-5 pt-12 pb-20">
        <div className="flex flex-col items-start gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/app">
              <ArrowLeftIcon />
              Volver a mi índice
            </Link>
          </Button>
          <h1 className="text-3xl font-medium tracking-heading">Ajustes</h1>
          <p className="text-sm text-muted-foreground">Entraste con {user.email}.</p>
        </div>

        <Frame label="perfil">
          <ProfileForm initialName={user.name} initialCity={city} />
        </Frame>

        <Frame label="tus datos">
          <div className="flex flex-col gap-4">
            <p className="text-sm leading-relaxed text-body">
              Descarga en un archivo JSON todo lo que índice guarda de ti: perfil, forma de entrar, categorías y enlaces con sus
              tags y fechas. Más detalles en la <Link href="/privacidad" className="text-foreground underline hover:text-primary">política de privacidad</Link>.
            </p>
            <div className="flex justify-end">
              <Button asChild variant="outline">
                <a href="/ajustes/exportar" download>
                  <DownloadIcon />
                  Descargar mis datos
                </a>
              </Button>
            </div>
          </div>
        </Frame>

        <Frame label="borrar cuenta">
          <DeleteAccount linkCount={links.length} />
        </Frame>
      </main>

      <SiteFooter person={user} />
    </>
  )
}
