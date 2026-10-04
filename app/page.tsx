import Link from "next/link"
import { BookmarkIcon, LockClosedIcon, UploadIcon } from "@radix-ui/react-icons"
import { Frame, FrameFooter } from "@/components/ds/frame"
import { GlyphBars } from "@/components/ds/glyph-bars"
import { GlyphHeatmap, GlyphHeatmapLegend } from "@/components/ds/glyph-heatmap"
import { IndexList } from "@/components/ds/index-list"
import { Logo } from "@/components/ds/logo"
import { SiteFooter } from "@/components/ds/site-footer"
import { SiteIcon } from "@/components/ds/site-icon"
import { ThemeToggle } from "@/components/ds/theme-toggle"
import { Button } from "@/components/ui/button"
import { SAMPLE_LINKS, sampleHeatWeeks } from "@/lib/sample-links"
import { relativeDay } from "@/lib/stats"

const features = [
  {
    label: "importa",
    title: "Desde Chrome en un paso",
    description: "Importa tus marcadores desde un archivo HTML. Los duplicados se omiten automáticamente.",
    Icon: UploadIcon,
  },
  {
    label: "ordena",
    title: "Categorías sugeridas",
    description: "Guarda una URL y recibe una sugerencia de nombre y categoría. Tú decides antes de guardarla.",
    Icon: BookmarkIcon,
  },
  {
    label: "privado",
    title: "Solo para ti",
    description: "Cada cuenta ve únicamente sus enlaces. No hay perfiles públicos.",
    Icon: LockClosedIcon,
  },
]

const categories = ["UI", "Diseño", "Dev", "IA", "Aprender"].map((label) => ({
  label,
  value: SAMPLE_LINKS.filter((link) => link.category === label).length,
}))

// Hoy, ayer, hace 3 días… Relativo a la fecha actual para que el ejemplo nunca envejezca.
const recent = ["7", "1", "10", "4", "9"].map((id, i) => {
  const link = SAMPLE_LINKS.find((l) => l.id === id)!
  return { ...link, when: relativeDay(new Date(Date.now() - [0, 1, 3, 6, 12][i] * 86_400_000), new Date()) }
})

export default function Home() {
  return (
    <>
      <header className="border-b border-dotted border-border">
        <div className="mx-auto flex h-13 max-w-5xl items-center gap-4 px-5">
          <Logo />
          <nav aria-label="Navegación principal" className="ml-auto flex items-center gap-2">
            <span className="hidden sm:block"><Button asChild variant="ghost"><Link href="#ejemplo">Ver un ejemplo</Link></Button></span>
            <ThemeToggle />
            <Button asChild size="sm"><Link href="/entrar">Entrar</Link></Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-5 pt-18 pb-24">
        <section className="flex max-w-3xl flex-col items-start gap-6">
          <p className="font-mono text-xs tracking-label text-primary">[ Marcadores ordenados como un libro ]</p>
          <h1 className="text-display font-medium tracking-display text-balance">
            Tus enlaces, con <span className="text-primary">índice</span> como un buen libro
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-body">
            Importa los marcadores de Chrome, deja que se clasifiquen y encuentra cualquiera desde el buscador. Tus enlaces son solo tuyos.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Button asChild><Link href="/entrar">Crear cuenta gratis</Link></Button>
            <Button asChild variant="outline"><Link href="#ejemplo">Ver un ejemplo</Link></Button>
          </div>
        </section>

        <section aria-label="Cómo funciona" className="grid gap-6 md:grid-cols-3">
          {features.map(({ label, title, description, Icon }) => (
            <Frame key={label} label={label}>
              <div className="flex flex-col gap-3">
                <h2 className="flex items-center gap-2 text-lg font-medium tracking-heading"><Icon aria-hidden />{title}</h2>
                <p className="text-sm leading-relaxed text-body">{description}</p>
              </div>
            </Frame>
          ))}
        </section>

        <section id="ejemplo" aria-labelledby="ejemplo-titulo" className="flex flex-col gap-5 scroll-mt-8">
          <div className="flex flex-col gap-2">
            <h2 id="ejemplo-titulo" className="text-2xl font-medium tracking-heading">Así se ve tu índice</h2>
            <p className="text-sm text-muted-foreground">Una muestra con enlaces de ejemplo. Tu biblioteca será privada.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Frame label="guardados · últimos 6 meses" className="md:col-span-2">
              <GlyphHeatmap weeks={sampleHeatWeeks()} />
              <FrameFooter><span>Datos de ejemplo</span><GlyphHeatmapLegend /></FrameFooter>
            </Frame>
            <Frame label="categorías"><GlyphBars rows={categories} /></Frame>
            <Frame label="recientes">
              <ul className="flex flex-col">
                {recent.map((link) => (
                  <li key={link.id} className="flex min-w-0 items-center gap-3 border-t border-dotted border-faint py-1.5 first:border-t-0">
                    <SiteIcon name={link.name} />
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate text-sm hover:text-primary">
                      {link.name}
                    </a>
                    <span className="hidden shrink-0 font-mono text-2xs text-muted-foreground sm:inline">{link.category}</span>
                    <span className="shrink-0 font-mono text-2xs text-muted-foreground">{link.when}</span>
                  </li>
                ))}
              </ul>
            </Frame>
            <Frame label="biblioteca A–Z" className="md:col-span-2">
              <IndexList items={SAMPLE_LINKS} />
              <FrameFooter><span>Ordenada de la A a la Z, como el índice de un libro.</span><span>12 enlaces de ejemplo</span></FrameFooter>
            </Frame>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
