import type { Metadata } from "next"
import Link from "next/link"
import { GearIcon, UploadIcon } from "@radix-ui/react-icons"
import { Frame, FrameFooter } from "@/components/ds/frame"
import { GlyphBars } from "@/components/ds/glyph-bars"
import { GlyphHeatmap, GlyphHeatmapLegend } from "@/components/ds/glyph-heatmap"
import { Logo } from "@/components/ds/logo"
import { SiteFooter } from "@/components/ds/site-footer"
import { SiteIcon } from "@/components/ds/site-icon"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ds/theme-toggle"
import { db } from "@/db"
import { SignOutButton } from "@/features/auth/sign-out-button"
import { LibraryProvider } from "@/features/library/library-provider"
import { LibraryView } from "@/features/library/library-view"
import { ReorganizeButton } from "@/features/library/reorganize-button"
import { AddButton, SearchButton, SearchIconButton } from "@/features/library/triggers"
import type { CategoryView, LinkView } from "@/features/library/types"
import { categoriesRepo } from "@/lib/dal/categories"
import { linksRepo } from "@/lib/dal/links"
import { faviconSrc } from "@/lib/favicon-url"
import { requireOnboardedUser } from "@/lib/session"
import { heatWeeks, relativeDay } from "@/lib/stats"

export const metadata: Metadata = { title: "Tu índice", robots: { index: false, follow: false } }

function hostOf(url: string) {
  return new URL(url).hostname.replace(/^www\./, "")
}

export default async function AppPage() {
  const user = await requireOnboardedUser()
  const [rows, cats] = await Promise.all([linksRepo(db).list(user.id), categoriesRepo(db).list(user.id)])
  const now = new Date()

  const links: LinkView[] = rows.map((l) => ({
    id: l.id,
    name: l.name,
    url: l.url,
    host: hostOf(l.url),
    categoryId: l.categoryId,
    tags: l.tags,
    pinned: l.pinned,
    createdAt: l.createdAt.toISOString(),
  }))
  const categories: CategoryView[] = cats.map((c) => ({ id: c.id, name: c.name, count: c.count }))
  const categoryName = new Map(categories.map((c) => [c.id, c.name]))
  const pinned = links.filter((l) => l.pinned)
  const weeks = heatWeeks(rows.map((r) => r.createdAt), now)
  const savedInPeriod = weeks.flatMap((w) => w.counts).reduce((a, b) => a + b, 0)

  return (
    <LibraryProvider links={links} categories={categories}>
      <header className="sticky top-0 z-20 border-b border-dotted border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-13 max-w-5xl items-center gap-3 px-5">
          <Logo />
          <div className="ml-auto flex items-center gap-2">
            <SearchIconButton />
            <ThemeToggle />
            <Button asChild variant="ghost" size="icon">
              <Link href="/ajustes" aria-label="Ajustes" title="Ajustes">
                <GearIcon />
              </Link>
            </Button>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-5 pt-12 pb-20">
        <section className="flex flex-col items-start gap-4 pb-6">
          <p className="font-mono text-xs text-muted-foreground">
            Hola, <span className="text-primary">{user.name}</span>
          </p>
          <h1 className="text-display font-medium tracking-display text-balance">
            {links.length === 0 ? "Tu índice está vacío" : `${links.length} ${links.length === 1 ? "enlace" : "enlaces"} en tu índice`}
          </h1>
          <div className="flex flex-wrap gap-2.5">
            <SearchButton />
            <AddButton />
            <Button asChild variant="ghost">
              <Link href="/importar">
                <UploadIcon />
                Importar de Chrome
              </Link>
            </Button>
          </div>
          <p className="font-mono text-2xs text-muted-foreground">También puedes pegar una URL en cualquier sitio de la página.</p>
        </section>

        {links.length === 0 ? (
          <Frame label="primeros pasos">
            <p className="text-sm text-body">
              Pega una URL o pulsa <span className="font-mono text-foreground">N</span> para guardar tu primer enlace, o{" "}
              <Link href="/importar" className="text-primary underline underline-offset-4">
                importa tus marcadores de Chrome
              </Link>
              .
            </p>
          </Frame>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Frame label="guardados · últimos 6 meses" className="md:col-span-2">
              <GlyphHeatmap weeks={weeks} />
              <FrameFooter>
                <span>
                  {savedInPeriod} {savedInPeriod === 1 ? "guardado" : "guardados"} en 26 semanas
                </span>
                <GlyphHeatmapLegend />
              </FrameFooter>
            </Frame>

            <Frame label="categorías">
              {categories.length > 0 ? (
                <GlyphBars rows={categories.map((c) => ({ label: c.name, value: c.count }))} />
              ) : (
                <p className="text-sm text-muted-foreground">Aún no tienes categorías. Crea una al añadir un enlace.</p>
              )}
            </Frame>

            <Frame label="recientes">
              <ul className="flex flex-col">
                {links.slice(0, 6).map((l) => (
                  <li key={l.id} className="flex min-w-0 items-center gap-3 border-t border-dotted border-faint py-1.5 first:border-t-0">
                    <SiteIcon src={faviconSrc(l.host)} name={l.name} />
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate text-sm hover:text-primary">
                      {l.name}
                    </a>
                    <span className="hidden shrink-0 font-mono text-2xs text-muted-foreground sm:inline">
                      {categoryName.get(l.categoryId ?? "") ?? ""}
                    </span>
                    <span className="shrink-0 font-mono text-2xs text-muted-foreground">{relativeDay(new Date(l.createdAt), now)}</span>
                  </li>
                ))}
              </ul>
            </Frame>

            {pinned.length > 0 ? (
              <Frame label="fijados" className="md:col-span-2">
                <ul className="flex flex-wrap gap-2.5">
                  {pinned.map((l) => (
                    <li key={l.id}>
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-dotted border-border px-3 py-2 text-sm transition-colors duration-150 hover:bg-accent"
                      >
                        <SiteIcon src={faviconSrc(l.host)} name={l.name} />
                        {l.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </Frame>
            ) : null}
          </div>
        )}

        {links.length > 0 ? (
          <section className="flex flex-col gap-4 pt-10" aria-labelledby="biblioteca">
            <div className="flex flex-col gap-1.5">
              <h2 id="biblioteca" className="text-2xl font-medium tracking-heading">
                Biblioteca
              </h2>
              <p className="text-sm text-muted-foreground">Todos tus enlaces de la A a la Z. Filtra por categoría o salta a una letra.</p>
            </div>
            <ReorganizeButton />
            <LibraryView links={links} categories={categories} now={now.getTime()} />
          </section>
        ) : null}
      </main>
      <SiteFooter person={user} />
    </LibraryProvider>
  )
}
