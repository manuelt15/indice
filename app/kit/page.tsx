import type { Metadata } from "next"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookmarkIcon,
  CheckIcon,
  Cross2Icon,
  DesktopIcon,
  DownloadIcon,
  EnvelopeClosedIcon,
  GearIcon,
  GitHubLogoIcon,
  InfoCircledIcon,
  Link2Icon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  ReloadIcon,
  SunIcon,
  TrashIcon,
  UploadIcon,
} from "@radix-ui/react-icons"
import { Frame, FrameFooter } from "@/components/ds/frame"
import { Globe } from "@/components/ds/globe"
import { GlyphBars } from "@/components/ds/glyph-bars"
import { GlyphHeatmap, GlyphHeatmapLegend } from "@/components/ds/glyph-heatmap"
import { IndexJump, IndexList } from "@/components/ds/index-list"
import { Logo } from "@/components/ds/logo"
import { SiteIcon } from "@/components/ds/site-icon"
import { ThemeToggle } from "@/components/ds/theme-toggle"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsCount, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SAMPLE_LINKS, sampleHeatWeeks } from "@/lib/sample-links"

export const metadata: Metadata = {
  title: "Kit · índice",
  robots: { index: false, follow: false },
}

const SWATCHES = [
  { token: "background", className: "bg-background" },
  { token: "muted / accent", className: "bg-muted" },
  { token: "secondary", className: "bg-secondary" },
  { token: "foreground", className: "bg-foreground" },
  { token: "body", className: "bg-body" },
  { token: "muted-foreground", className: "bg-muted-foreground" },
  { token: "faint", className: "bg-faint" },
  { token: "border / input", className: "bg-border" },
  { token: "primary", className: "bg-primary" },
  { token: "primary-soft", className: "bg-primary-soft" },
]

const SPACING = [
  { token: "1", px: 4, className: "w-1" },
  { token: "2", px: 8, className: "w-2" },
  { token: "3", px: 12, className: "w-3" },
  { token: "4", px: 16, className: "w-4" },
  { token: "6", px: 24, className: "w-6" },
  { token: "8", px: 32, className: "w-8" },
  { token: "12", px: 48, className: "w-12" },
  { token: "18", px: 72, className: "w-18" },
]

const ICONS = [
  { name: "MagnifyingGlass", Icon: MagnifyingGlassIcon },
  { name: "Desktop", Icon: DesktopIcon },
  { name: "Sun", Icon: SunIcon },
  { name: "Moon", Icon: MoonIcon },
  { name: "GitHubLogo", Icon: GitHubLogoIcon },
  { name: "EnvelopeClosed", Icon: EnvelopeClosedIcon },
  { name: "Gear", Icon: GearIcon },
  { name: "Upload", Icon: UploadIcon },
  { name: "Download", Icon: DownloadIcon },
  { name: "Bookmark", Icon: BookmarkIcon },
  { name: "Link2", Icon: Link2Icon },
  { name: "LockClosed", Icon: LockClosedIcon },
  { name: "InfoCircled", Icon: InfoCircledIcon },
  { name: "ArrowLeft", Icon: ArrowLeftIcon },
  { name: "ArrowRight", Icon: ArrowRightIcon },
  { name: "Reload", Icon: ReloadIcon },
  { name: "Check", Icon: CheckIcon },
  { name: "Cross2", Icon: Cross2Icon },
  { name: "Trash", Icon: TrashIcon },
]

const CATEGORY_COUNTS = ["UI", "Diseño", "Dev", "IA", "Aprender"].map((label) => ({
  label,
  value: SAMPLE_LINKS.filter((l) => l.category === label).length,
}))

export default function KitPage() {
  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-20 border-b border-dotted border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-13 max-w-5xl items-center gap-6 px-5">
          <Logo />
          <span className="font-mono text-xs text-muted-foreground">/kit</span>
          <ThemeToggle className="ml-auto" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 pt-14 pb-24">
        <div className="flex flex-col gap-2 pb-6">
          <h1 className="text-3xl font-medium tracking-heading">Kit del sistema</h1>
          <p className="max-w-2xl text-muted-foreground">
            Catálogo vivo de tokens y componentes de índice. Si algo no está aquí, no existe en la app.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Frame label="color · semánticos" className="md:col-span-2">
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {SWATCHES.map((s) => (
                <li key={s.token} className="flex flex-col gap-1.5">
                  <span className={`h-11 rounded-lg border border-dotted border-border ${s.className}`} />
                  <span className="font-mono text-2xs text-muted-foreground">{s.token}</span>
                </li>
              ))}
            </ul>
            <FrameFooter>
              <span>Cambia el tema arriba: los mismos tokens, otros valores.</span>
            </FrameFooter>
          </Frame>

          <Frame label="tipografía">
            <dl className="flex flex-col gap-3">
              <div className="flex items-baseline gap-4">
                <dt className="w-28 shrink-0 font-mono text-2xs text-muted-foreground">display · 500</dt>
                <dd className="text-display font-medium tracking-display">índice</dd>
              </div>
              <div className="flex items-baseline gap-4">
                <dt className="w-28 shrink-0 font-mono text-2xs text-muted-foreground">heading · 500</dt>
                <dd className="text-2xl font-medium tracking-heading">Biblioteca</dd>
              </div>
              <div className="flex items-baseline gap-4">
                <dt className="w-28 shrink-0 font-mono text-2xs text-muted-foreground">body · 400</dt>
                <dd className="text-body">Enlaces ordenados por categoría.</dd>
              </div>
              <div className="flex items-baseline gap-4">
                <dt className="w-28 shrink-0 font-mono text-2xs text-muted-foreground">mono-label</dt>
                <dd className="font-mono text-xs tracking-label text-primary">[ recientes ]</dd>
              </div>
              <div className="flex items-baseline gap-4">
                <dt className="w-28 shrink-0 font-mono text-2xs text-muted-foreground">mono-meta</dt>
                <dd className="font-mono text-xs text-muted-foreground">ui.shadcn.com · Hace 2 d</dd>
              </div>
            </dl>
          </Frame>

          <Frame label="espacio · base 4px">
            <ul className="flex flex-col gap-2 font-mono text-2xs text-muted-foreground">
              {SPACING.map((s) => (
                <li key={s.token} className="flex items-center gap-3">
                  <span className="w-16">space-{s.token}</span>
                  <span className={`h-2 bg-primary ${s.className}`} />
                  <span>{s.px}px</span>
                </li>
              ))}
            </ul>
          </Frame>

          <Frame label="botones e inputs">
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <Button>Primario</Button>
                <Button variant="outline">Secundario</Button>
                <Button variant="ghost">Fantasma</Button>
                <Button size="sm" variant="outline">
                  Pequeño
                </Button>
                <Button size="sm" variant="destructive">
                  <TrashIcon />
                  Borrar
                </Button>
              </div>
              <Button>
                <MagnifyingGlassIcon />
                Buscar o pegar una URL
                <Kbd>⌘K</Kbd>
              </Button>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="kit-url">URL</Label>
                <Input id="kit-url" placeholder="https://…" />
              </div>
              <div className="flex items-start gap-2.5">
                <Checkbox id="kit-consent" />
                <Label htmlFor="kit-consent" variant="inline">
                  Tengo 14 años o más y acepto los términos.
                </Label>
              </div>
              <div className="flex flex-wrap gap-2">
                <Kbd>⌘K</Kbd>
                <Kbd>N</Kbd>
                <Kbd>esc</Kbd>
              </div>
            </div>
          </Frame>

          <Frame label="pestañas">
            <Tabs defaultValue="UI">
              <TabsList>
                {CATEGORY_COUNTS.map((c) => (
                  <TabsTrigger key={c.label} value={c.label}>
                    {c.label}
                    <TabsCount>{c.value}</TabsCount>
                  </TabsTrigger>
                ))}
              </TabsList>
              {CATEGORY_COUNTS.map((c) => (
                <TabsContent key={c.label} value={c.label}>
                  <p className="text-sm text-body">
                    {c.value} enlaces en {c.label}.
                  </p>
                </TabsContent>
              ))}
            </Tabs>
          </Frame>

          <Frame label="guardados · últimos 6 meses" className="md:col-span-2">
            <GlyphHeatmap weeks={sampleHeatWeeks()} />
            <FrameFooter>
              <span>Datos de ejemplo</span>
              <GlyphHeatmapLegend />
            </FrameFooter>
          </Frame>

          <Frame label="categorías">
            <GlyphBars rows={CATEGORY_COUNTS} />
          </Frame>

          <Frame label="marca">
            <div className="flex flex-col gap-5">
              <div className="flex items-end gap-5">
                <Globe size="sm" />
                <Globe size="md" />
                <Globe size="lg" />
                <Globe size="xl" />
              </div>
              <Logo />
              <div className="flex items-center gap-3 text-sm text-body">
                <SiteIcon name="Excalidraw" />
                Sin favicon se muestra la inicial.
              </div>
            </div>
          </Frame>

          <Frame label="índice A–Z" className="md:col-span-2">
            <IndexJump items={SAMPLE_LINKS} className="mb-5" />
            <IndexList items={SAMPLE_LINKS} />
          </Frame>

          <Frame label="iconos · radix" className="md:col-span-2">
            <ul className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-7">
              {ICONS.map(({ name, Icon }) => (
                <li key={name} className="flex flex-col items-center gap-2 text-body">
                  <Icon aria-hidden />
                  <span className="font-mono text-2xs text-muted-foreground">{name}</span>
                </li>
              ))}
            </ul>
            <FrameFooter>
              <span>15 × 15 · currentColor</span>
              <span>Excepciones: el globo y los logos oficiales de Google y GitHub en el login</span>
            </FrameFooter>
          </Frame>
        </div>
      </main>
    </div>
  )
}
