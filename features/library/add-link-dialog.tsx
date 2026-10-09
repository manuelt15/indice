"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { addLinkAction, previewLinkAction } from "@/features/library/actions"
import type { CategoryView } from "@/features/library/types"

const NEW_CATEGORY = "__nueva__"

function isHttpUrl(value: string) {
  try {
    const url = new URL(value.trim())
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

/** Añadir un enlace: propone el nombre a partir del título de la página; tú decides antes de guardar. */
export function AddLinkDialog({
  open,
  initialUrl,
  categories,
  onOpenChange,
  onSaved,
}: {
  open: boolean
  initialUrl: string
  categories: CategoryView[]
  onOpenChange: (open: boolean) => void
  onSaved: (name: string) => void
}) {
  const router = useRouter()
  const [url, setUrl] = React.useState(initialUrl)
  const [name, setName] = React.useState("")
  const [nameTouched, setNameTouched] = React.useState(false)
  const [category, setCategory] = React.useState("")
  const [newCategory, setNewCategory] = React.useState("")
  const [tags, setTags] = React.useState("")
  const [pinned, setPinned] = React.useState(false)
  const [status, setStatus] = React.useState<string | null>(isHttpUrl(initialUrl) ? "Leyendo la página…" : null)
  const [error, setError] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()
  const [suggested, setSuggested] = React.useState<string | null>(null)
  const categoryTouched = React.useRef(false)

  /** Aplica la categoría sugerida si el usuario aún no ha elegido una. */
  const applySuggestion = React.useCallback(
    (suggestion: { category: string; reasons: string[] } | null) => {
      if (!suggestion || categoryTouched.current) return
      const existing = categories.find((c) => c.name.toLowerCase() === suggestion.category.toLowerCase())
      setCategory(existing ? existing.id : NEW_CATEGORY)
      if (!existing) setNewCategory(suggestion.category)
      setSuggested(`Sugerida: ${suggestion.category}, por ${suggestion.reasons.join(", ")}.`)
    },
    [categories]
  )

  const lookup = React.useCallback(
    async (value: string) => {
      if (!isHttpUrl(value)) return
      setStatus("Leyendo la página…")
      const preview = await previewLinkAction(value.trim())
      setStatus(null)
      if (preview.ok && !nameTouched) setName(preview.title ?? preview.host)
      if (preview.ok) applySuggestion(preview.suggestion)
    },
    [nameTouched, applySuggestion]
  )

  // Al abrir con una URL pegada, propone el nombre en cuanto llega el título.
  React.useEffect(() => {
    if (!isHttpUrl(initialUrl)) return
    let cancelled = false
    previewLinkAction(initialUrl.trim()).then((preview) => {
      if (cancelled) return
      setStatus(null)
      if (preview.ok) {
        setName((current) => current || (preview.title ?? preview.host))
        applySuggestion(preview.suggestion)
      }
    })
    return () => {
      cancelled = true
    }
  }, [initialUrl, applySuggestion])

  function submit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await addLinkAction({
        url: url.trim(),
        name,
        categoryId: category && category !== NEW_CATEGORY ? category : null,
        newCategory: category === NEW_CATEGORY ? newCategory : null,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        pinned,
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      onOpenChange(false)
      onSaved(name.trim())
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent label="añadir enlace">
        <form onSubmit={submit} className="flex flex-col gap-4 overflow-y-auto px-6 pt-8 pb-6">
          <div className="flex flex-col gap-1">
            <DialogTitle>Añadir enlace</DialogTitle>
            <DialogDescription>Te proponemos un nombre a partir de la página. Lo revisas antes de guardar.</DialogDescription>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="add-url">URL</Label>
            <Input
              id="add-url"
              type="url"
              inputMode="url"
              autoComplete="off"
              placeholder="https://…"
              required
              autoFocus={!initialUrl}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => void lookup(url)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="add-name">Nombre</Label>
            <Input
              id="add-name"
              autoComplete="off"
              maxLength={200}
              required
              autoFocus={!!initialUrl}
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setNameTouched(true)
              }}
            />
            <p aria-live="polite" className="font-mono text-2xs text-muted-foreground">
              {status ?? " "}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-category">Categoría</Label>
              <NativeSelect
                id="add-category"
                value={category}
                onChange={(e) => {
                  categoryTouched.current = true
                  setSuggested(null)
                  setCategory(e.target.value)
                }}
              >
                <NativeSelectOption value="">Sin categoría</NativeSelectOption>
                {categories.map((c) => (
                  <NativeSelectOption key={c.id} value={c.id}>
                    {c.name}
                  </NativeSelectOption>
                ))}
                <NativeSelectOption value={NEW_CATEGORY}>Nueva categoría…</NativeSelectOption>
              </NativeSelect>
              {suggested ? <p className="font-mono text-2xs text-muted-foreground">{suggested}</p> : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-tags">Tags, separados por coma</Label>
              <Input id="add-tags" autoComplete="off" placeholder="react, componentes" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
          </div>

          {category === NEW_CATEGORY ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-new-category">Nombre de la nueva categoría</Label>
              <Input id="add-new-category" autoComplete="off" maxLength={40} required value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
            </div>
          ) : null}

          <div className="flex items-center gap-2.5">
            <Checkbox id="add-pinned" checked={pinned} onCheckedChange={(v) => setPinned(v === true)} />
            <Label htmlFor="add-pinned" variant="inline">
              Fijar arriba (uso diario)
            </Label>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
