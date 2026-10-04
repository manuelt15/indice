"use client"

import * as React from "react"
import { IndexJump, IndexList, type IndexItem } from "@/components/ds/index-list"
import { Tabs, TabsCount, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LinkActions } from "@/features/library/link-actions"
import type { CategoryView, LinkView } from "@/features/library/types"

const ALL = "todas"
const NONE = "sin-categoria"
const NEW_MS = 7 * 24 * 60 * 60 * 1000

/** Biblioteca A–Z con pestañas por categoría. */
export function LibraryView({ links, categories, now }: { links: LinkView[]; categories: CategoryView[]; now: number }) {
  const [tab, setTab] = React.useState(ALL)
  const uncategorized = links.filter((l) => !l.categoryId).length

  const visible = links.filter((l) => tab === ALL || (tab === NONE ? !l.categoryId : l.categoryId === tab))
  const items: IndexItem[] = visible.map((l) => ({
    id: l.id,
    name: l.name,
    href: l.url,
    host: l.host,
    iconSrc: `/api/favicon/${l.host}`,
    pinned: l.pinned,
    isNew: now - new Date(l.createdAt).getTime() < NEW_MS,
    actions: <LinkActions id={l.id} name={l.name} pinned={l.pinned} />,
  }))

  return (
    <div className="flex flex-col gap-5">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList aria-label="Categorías">
          <TabsTrigger value={ALL}>
            Todas <TabsCount>{links.length}</TabsCount>
          </TabsTrigger>
          {categories.map((c) => (
            <TabsTrigger key={c.id} value={c.id}>
              {c.name} <TabsCount>{c.count}</TabsCount>
            </TabsTrigger>
          ))}
          {uncategorized > 0 && categories.length > 0 ? (
            <TabsTrigger value={NONE}>
              Sin categoría <TabsCount>{uncategorized}</TabsCount>
            </TabsTrigger>
          ) : null}
        </TabsList>
      </Tabs>
      <IndexJump items={items} />
      {items.length > 0 ? (
        <IndexList items={items} />
      ) : (
        <p className="font-mono text-xs text-muted-foreground">No hay enlaces en esta categoría.</p>
      )}
    </div>
  )
}
