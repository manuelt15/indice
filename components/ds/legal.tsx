import Link from "next/link"
import { Frame } from "@/components/ds/frame"
import { Logo } from "@/components/ds/logo"
import { SiteFooter } from "@/components/ds/site-footer"
import { ThemeToggle } from "@/components/ds/theme-toggle"

/** Página legal: cabecera mínima, título, fecha de la versión y secciones. Pensada para leerse, no para escanearse. */
function LegalPage({ title, updated, intro, children }: { title: string; updated: string; intro: string; children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-dotted border-border">
        <div className="mx-auto flex h-13 max-w-5xl items-center gap-4 px-5">
          <Logo />
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-5 pt-14 pb-20">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs tracking-label text-primary">[ Última actualización: {updated} ]</p>
          <h1 className="text-4xl font-medium tracking-heading text-balance">{title}</h1>
          <p className="text-base leading-relaxed text-body">{intro}</p>
        </div>
        <div className="flex flex-col gap-6">{children}</div>
      </main>
      <SiteFooter />
    </>
  )
}

/** Una sección: etiqueta del marco y título, y el texto dentro. */
function LegalSection({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <Frame label={label}>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium tracking-heading">{title}</h2>
        <div className="flex flex-col gap-3 text-sm leading-relaxed text-body">{children}</div>
      </section>
    </Frame>
  )
}

/** Lista con viñeta de acento, como el resto de listas de índice. */
function LegalList({ children }: { children: React.ReactNode }) {
  return <ul className="flex list-disc flex-col gap-1.5 pl-5 marker:text-primary">{children}</ul>
}

/** Enlace dentro del texto legal. Los externos se abren aparte y sin enviar de dónde vienes. */
function LegalLink({ href, children }: { href: string; children: React.ReactNode }) {
  const external = /^(https?:|mailto:)/.test(href)
  return external ? (
    <a href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer" className="text-foreground underline hover:text-primary">
      {children}
    </a>
  ) : (
    <Link href={href} className="text-foreground underline hover:text-primary">
      {children}
    </Link>
  )
}

export { LegalLink, LegalList, LegalPage, LegalSection }
