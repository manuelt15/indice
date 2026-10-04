import { cn } from "cn"
import { SiteIcon } from "@/components/ds/site-icon"
import { INDEX_LETTERS, OTHER_LETTER, groupByInitial } from "@/lib/indexing"

export type IndexItem = {
  id: string
  name: string
  href: string
  host: string
  iconSrc?: string | null
  isNew?: boolean
  pinned?: boolean
  /** Acciones de la entrada (fijar, borrar…). Aparecen al pasar el ratón o al enfocar. */
  actions?: React.ReactNode
}

function letterId(letter: string) {
  return letter === OTHER_LETTER ? "indice-otros" : `indice-${letter}`
}

/** Entrada del índice: icono, nombre, puntos guía y dominio. */
function IndexEntry({ item }: { item: IndexItem }) {
  return (
    <div className="group/entry flex min-w-0 items-center gap-1 rounded-lg transition-colors duration-150 hover:bg-accent">
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-w-0 flex-1 items-baseline gap-2.5 px-1.5 py-1"
      >
        <SiteIcon src={item.iconSrc} name={item.name} className="self-center" />
        <span className="max-w-3/5 truncate text-foreground">{item.name}</span>
        {item.pinned ? <span className="font-mono text-2xs text-primary">fijado</span> : null}
        {item.isNew ? <span className="font-mono text-2xs text-primary">nuevo</span> : null}
        <span aria-hidden className="min-w-3 flex-1 -translate-y-1 border-b border-dotted border-faint" />
        <span className="max-w-2/5 shrink-0 truncate font-mono text-xs text-muted-foreground">{item.host}</span>
      </a>
      {item.actions ? (
        <div className="flex shrink-0 items-center opacity-0 transition-opacity duration-150 group-focus-within/entry:opacity-100 group-hover/entry:opacity-100 has-data-confirming:opacity-100 pointer-coarse:opacity-100">
          {item.actions}
        </div>
      ) : null}
    </div>
  )
}

/** Lista A–Z como el índice de un libro. */
function IndexList({ items, className }: { items: IndexItem[]; className?: string }) {
  const groups = groupByInitial(items)
  return (
    <div className={cn("columns-1 gap-10 lg:columns-2", className)}>
      {groups.map((group) => (
        <section key={group.letter} id={letterId(group.letter)} className="mb-5 break-inside-avoid">
          <h3 className="mb-1 font-mono text-sm font-normal text-primary">{group.letter}</h3>
          <ul>
            {group.items.map((item) => (
              <li key={item.id}>
                <IndexEntry item={item} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

/** Barra de letras para saltar dentro del índice. Las letras sin enlaces quedan apagadas. */
function IndexJump({ items, className }: { items: IndexItem[]; className?: string }) {
  const present = new Set(groupByInitial(items).map((g) => g.letter))
  return (
    <nav aria-label="Saltar a una letra" className={cn("flex flex-wrap gap-0.5 font-mono text-xs", className)}>
      {[...INDEX_LETTERS, OTHER_LETTER].map((letter) =>
        present.has(letter) ? (
          <a
            key={letter}
            href={`#${letterId(letter)}`}
            className="rounded-lg px-1.5 py-0.5 text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
          >
            {letter}
          </a>
        ) : (
          <span key={letter} aria-hidden className="px-1.5 py-0.5 text-faint">
            {letter}
          </span>
        )
      )}
    </nav>
  )
}

export { IndexList, IndexEntry, IndexJump }
