"use client"

import * as React from "react"
import { SiteIcon } from "@/components/ds/site-icon"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import type { CategoryView, LinkView } from "@/features/library/types"
import { faviconSrc } from "@/lib/favicon-url"

function fold(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
}

function Highlight({ text, query }: { text: string; query: string }) {
  const i = query ? fold(text).indexOf(fold(query)) : -1
  if (i < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-primary-soft text-foreground">{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  )
}

/** Buscador ⌘K: por nombre, tag, dominio o categoría. Si escribes o pegas una URL, ofrece añadirla. */
export function SearchDialog({
  open,
  onOpenChange,
  links,
  categories,
  onAddUrl,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  links: LinkView[]
  categories: CategoryView[]
  onAddUrl: (url: string) => void
}) {
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState(0)
  const categoryName = React.useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories])

  const q = query.trim()
  const isUrl = /^https?:\/\/\S+$/i.test(q)
  const results = React.useMemo(() => {
    if (isUrl) return []
    const needle = fold(q)
    return links
      .filter((l) => {
        if (!needle) return true
        const haystack = fold([l.name, l.host, l.tags.join(" "), categoryName.get(l.categoryId ?? "") ?? ""].join(" "))
        return haystack.includes(needle)
      })
      .slice(0, 8)
  }, [links, q, isUrl, categoryName])

  function openLink(link: LinkView) {
    window.open(link.url, "_blank", "noopener,noreferrer")
    onOpenChange(false)
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setSelected((s) => Math.min(s + 1, Math.max(results.length - 1, 0)))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    } else if (event.key === "Enter") {
      event.preventDefault()
      if (isUrl) onAddUrl(q)
      else if (results[selected]) openLink(results[selected])
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) {
          setQuery("")
          setSelected(0)
        }
      }}
    >
      <DialogContent label="buscar" showCloseButton={false} aria-describedby={undefined}>
        <DialogTitle className="sr-only">Buscar enlaces</DialogTitle>
        <div className="flex items-center gap-2.5 border-b border-dotted border-border px-4 pt-5 pb-3 font-mono">
          <span aria-hidden className="text-primary">
            &gt;
          </span>
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelected(0)
            }}
            onKeyDown={onKeyDown}
            placeholder="Busca por nombre, tag o dominio, o pega una URL"
            aria-label="Buscar enlaces"
            role="combobox"
            aria-expanded
            aria-controls="search-results"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <ul id="search-results" role="listbox" aria-label="Resultados" className="flex max-h-96 flex-col overflow-y-auto p-2">
          {isUrl ? (
            <li className="px-3 py-6 text-center font-mono text-xs text-muted-foreground">
              Pulsa ↵ para añadir <mark className="bg-primary-soft text-foreground">{q}</mark>
            </li>
          ) : results.length === 0 ? (
            <li className="px-3 py-6 text-center font-mono text-xs text-muted-foreground">
              {links.length === 0 ? "Aún no tienes enlaces. Pega una URL para añadir el primero." : `Nada con «${q}».`}
            </li>
          ) : (
            results.map((link, i) => (
              <li key={link.id} role="option" aria-selected={i === selected}>
                <button
                  type="button"
                  onMouseEnter={() => setSelected(i)}
                  onClick={() => openLink(link)}
                  className="flex w-full min-w-0 items-center gap-3 rounded-lg px-2.5 py-2 text-left aria-selected:bg-secondary in-aria-selected:bg-secondary"
                >
                  <SiteIcon src={faviconSrc(link.host)} name={link.name} />
                  <span className="min-w-0 truncate text-sm text-foreground">
                    <Highlight text={link.name} query={q} />
                  </span>
                  <span className="truncate font-mono text-xs text-muted-foreground">
                    <Highlight text={link.host} query={q} />
                  </span>
                  <span className="ml-auto shrink-0 font-mono text-2xs text-muted-foreground">
                    {categoryName.get(link.categoryId ?? "") ?? ""}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="flex flex-wrap gap-4 border-t border-dotted border-border px-4 py-2.5 font-mono text-2xs text-muted-foreground">
          <span>↑↓ Moverse</span>
          <span>↵ Abrir</span>
          <span>esc Cerrar</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
