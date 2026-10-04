"use client"

import * as React from "react"
import { AddLinkDialog } from "@/features/library/add-link-dialog"
import { SearchDialog } from "@/features/library/search-dialog"
import type { CategoryView, LinkView } from "@/features/library/types"

type LibraryContext = {
  openSearch: () => void
  openAdd: (url?: string) => void
}

const Context = React.createContext<LibraryContext | null>(null)

export function useLibrary() {
  const ctx = React.useContext(Context)
  if (!ctx) throw new Error("useLibrary debe usarse dentro de LibraryProvider.")
  return ctx
}

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))
}

function looksLikeUrl(text: string): boolean {
  return /^https?:\/\/\S+$/i.test(text.trim())
}

/** Atajos y diálogos de la biblioteca: ⌘K busca, N añade, pegar una URL en cualquier sitio la añade. */
export function LibraryProvider({
  links,
  categories,
  children,
}: {
  links: LinkView[]
  categories: CategoryView[]
  children: React.ReactNode
}) {
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [add, setAdd] = React.useState<{ open: boolean; url: string }>({ open: false, url: "" })

  const value = React.useMemo<LibraryContext>(
    () => ({
      openSearch: () => setSearchOpen(true),
      openAdd: (url = "") => {
        setSearchOpen(false)
        setAdd({ open: true, url })
      },
    }),
    []
  )

  React.useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setSearchOpen((open) => !open)
        return
      }
      if (event.key.toLowerCase() === "n" && !event.metaKey && !event.ctrlKey && !event.altKey && !isTyping(event.target)) {
        if (document.querySelector("[data-slot=dialog-content]")) return
        event.preventDefault()
        value.openAdd()
      }
    }
    function onPaste(event: ClipboardEvent) {
      if (isTyping(event.target) || document.querySelector("[data-slot=dialog-content]")) return
      const text = event.clipboardData?.getData("text") ?? ""
      if (looksLikeUrl(text)) {
        event.preventDefault()
        value.openAdd(text.trim())
      }
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener("paste", onPaste)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("paste", onPaste)
    }
  }, [value])

  return (
    <Context.Provider value={value}>
      {children}
      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        links={links}
        categories={categories}
        onAddUrl={(url) => value.openAdd(url)}
      />
      <AddLinkDialog
        key={add.open ? `open-${add.url}` : "closed"}
        open={add.open}
        initialUrl={add.url}
        categories={categories}
        onOpenChange={(open) => setAdd((s) => ({ ...s, open }))}
      />
    </Context.Provider>
  )
}
