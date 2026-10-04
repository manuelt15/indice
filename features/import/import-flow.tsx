"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRightIcon, UploadIcon } from "@radix-ui/react-icons"
import { Frame } from "@/components/ds/frame"
import { Button } from "@/components/ui/button"
import { importBookmarksAction } from "@/features/import/actions"
import type { ImportSummary } from "@/lib/dal/import"
import { MAX_BOOKMARKS, MAX_FILE_BYTES, parseBookmarksHtml, type ParseResult } from "@/lib/import/bookmarks-html"

type State =
  | { kind: "idle"; error?: string }
  | { kind: "ready"; fileName: string; result: ParseResult }
  | { kind: "done"; summary: ImportSummary }

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`
}

/** Importar desde Chrome: el archivo se lee en tu navegador y solo se envían los enlaces. */
export function ImportFlow() {
  const [state, setState] = React.useState<State>({ kind: "idle" })
  const [dragging, setDragging] = React.useState(false)
  const [pending, startTransition] = React.useTransition()
  const inputRef = React.useRef<HTMLInputElement>(null)

  async function readFile(file: File | undefined) {
    if (!file) return
    if (file.size > MAX_FILE_BYTES) {
      setState({ kind: "idle", error: "El archivo pesa más de 5 MB. Exporta solo tus marcadores, sin el historial." })
      return
    }
    const result = parseBookmarksHtml(await file.text())
    if (result.bookmarks.length === 0) {
      setState({ kind: "idle", error: "No hemos encontrado marcadores en ese archivo. Usa el .html que exporta Chrome." })
      return
    }
    if (result.bookmarks.length > MAX_BOOKMARKS) {
      setState({ kind: "idle", error: `El archivo tiene más de ${MAX_BOOKMARKS} marcadores. Divídelo en partes.` })
      return
    }
    setState({ kind: "ready", fileName: file.name, result })
  }

  function startImport() {
    if (state.kind !== "ready") return
    startTransition(async () => {
      const response = await importBookmarksAction(state.result.bookmarks)
      setState(response.ok ? { kind: "done", summary: response.summary } : { kind: "idle", error: response.error })
    })
  }

  if (state.kind === "done") {
    const { added, duplicates, invalid, categories } = state.summary
    return (
      <Frame label="importación completada">
        <div className="flex flex-col gap-4">
          <p className="text-display font-medium tracking-display">{added}</p>
          <p className="text-body">
            {plural(added, "enlace añadido", "enlaces añadidos")} a tu índice
            {categories > 0 ? `, en ${plural(categories, "categoría nueva", "categorías nuevas")}` : ""}.
          </p>
          <ul className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
            {duplicates > 0 ? (
              <li>{plural(duplicates, "enlace estaba repetido o ya lo tenías", "enlaces estaban repetidos o ya los tenías")}: no se han duplicado.</li>
            ) : null}
            {invalid > 0 ? <li>{plural(invalid, "entrada no válida descartada", "entradas no válidas descartadas")}.</li> : null}
          </ul>
          <div>
            <Button asChild>
              <Link href="/app">
                Ver mi índice
                <ArrowRightIcon />
              </Link>
            </Button>
          </div>
        </div>
      </Frame>
    )
  }

  if (state.kind === "ready") {
    const { bookmarks, skipped } = state.result
    const folders = new Set(bookmarks.map((b) => b.folders[0]).filter(Boolean))
    return (
      <Frame label="revisa antes de importar">
        <div className="flex flex-col gap-4">
          <p className="font-mono text-xs text-muted-foreground">{state.fileName}</p>
          <p className="text-body">
            Hemos encontrado <span className="text-foreground">{plural(bookmarks.length, "enlace", "enlaces")}</span>
            {folders.size > 0 ? ` en ${plural(folders.size, "carpeta", "carpetas")}` : ""}. Cada carpeta de primer nivel será una
            categoría y las subcarpetas, tags. Los enlaces que ya tengas no se duplicarán.
          </p>
          {skipped > 0 ? (
            <p className="font-mono text-xs text-muted-foreground">
              {plural(skipped, "entrada se ignora", "entradas se ignoran")} porque no son páginas web (bookmarklets o ajustes del navegador).
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2.5">
            <Button onClick={startImport} disabled={pending}>
              <UploadIcon />
              {pending ? "Importando…" : `Importar ${plural(bookmarks.length, "enlace", "enlaces")}`}
            </Button>
            <Button variant="outline" disabled={pending} onClick={() => setState({ kind: "idle" })}>
              Elegir otro archivo
            </Button>
          </div>
        </div>
      </Frame>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Frame label="1 · exporta desde chrome">
        <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-body">
          <li>En Chrome, abre el menú y entra en Marcadores y listas, y después en Administrar marcadores.</li>
          <li>Pulsa los tres puntos de arriba a la derecha y elige Exportar marcadores.</li>
          <li>Guarda el archivo .html en tu ordenador.</li>
        </ol>
        <p className="mt-3 font-mono text-2xs text-muted-foreground">También vale el archivo que exportan Edge, Firefox o Safari.</p>
      </Frame>

      <Frame label="2 · súbelo aquí">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            void readFile(e.dataTransfer.files[0])
          }}
          data-dragging={dragging || undefined}
          className="flex flex-col items-center gap-3 rounded-lg border border-dotted border-border px-6 py-10 text-center transition-colors duration-150 data-dragging:border-primary data-dragging:bg-accent"
        >
          <UploadIcon aria-hidden className="size-5 text-primary" />
          <p className="text-sm text-body">Arrastra aquí el archivo .html o elígelo.</p>
          <input
            ref={inputRef}
            type="file"
            accept=".html,.htm,text/html"
            className="sr-only"
            id="bookmarks-file"
            onChange={(e) => void readFile(e.target.files?.[0])}
          />
          <Button variant="outline" onClick={() => inputRef.current?.click()}>
            Elegir archivo
          </Button>
          <p className="font-mono text-2xs text-muted-foreground">
            El archivo se lee en tu navegador. Solo enviamos los enlaces, nunca el archivo.
          </p>
        </div>
        {state.error ? (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}
      </Frame>
    </div>
  )
}
