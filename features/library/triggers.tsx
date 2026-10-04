"use client"

import { MagnifyingGlassIcon, PlusIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { useLibrary } from "@/features/library/library-provider"

export function SearchButton() {
  const { openSearch } = useLibrary()
  return (
    <Button onClick={openSearch}>
      <MagnifyingGlassIcon />
      Buscar o pegar una URL
      <Kbd>⌘K</Kbd>
    </Button>
  )
}

export function SearchIconButton() {
  const { openSearch } = useLibrary()
  return (
    <Button size="icon" variant="ghost" aria-label="Buscar (⌘K)" title="Buscar (⌘K)" onClick={openSearch}>
      <MagnifyingGlassIcon />
    </Button>
  )
}

export function AddButton({ label = "Añadir enlace" }: { label?: string }) {
  const { openAdd } = useLibrary()
  return (
    <Button variant="outline" onClick={() => openAdd()}>
      <PlusIcon />
      {label}
      <Kbd>N</Kbd>
    </Button>
  )
}
