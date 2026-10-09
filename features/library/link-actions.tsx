"use client"

import * as React from "react"
import { DrawingPinFilledIcon, DrawingPinIcon, TrashIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { deleteLinkAction, setPinnedAction } from "@/features/library/actions"
import { useLibrary } from "@/features/library/library-provider"
import type { ActionResult } from "@/features/library/types"

/** Fijar y borrar un enlace. Borrar pide confirmación en el mismo sitio y avisa al terminar. */
export function LinkActions({ id, name, pinned }: { id: string; name: string; pinned: boolean }) {
  const router = useRouter()
  const { notify } = useLibrary()
  const [confirming, setConfirming] = React.useState(false)
  const [pending, startTransition] = React.useTransition()

  function run(action: () => Promise<ActionResult>, done?: string) {
    startTransition(async () => {
      const result = await action()
      setConfirming(false)
      if (!result.ok) notify(result.error, "error")
      else if (done) notify(done)
      router.refresh()
    })
  }

  if (confirming) {
    return (
      <div data-confirming className="flex items-center gap-1">
        <Button size="sm" variant="destructive" disabled={pending} onClick={() => run(() => deleteLinkAction(id), `«${name}» se ha borrado de tu índice.`)}>
          Borrar
        </Button>
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => setConfirming(false)}>
          No
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center">
      <Button
        size="icon"
        variant="ghost"
        disabled={pending}
        aria-label={pinned ? `Quitar ${name} de fijados` : `Fijar ${name}`}
        aria-pressed={pinned}
        onClick={() => run(() => setPinnedAction(id, !pinned))}
      >
        {pinned ? <DrawingPinFilledIcon /> : <DrawingPinIcon />}
      </Button>
      <Button size="icon" variant="ghost" disabled={pending} aria-label={`Borrar ${name}`} onClick={() => setConfirming(true)}>
        <TrashIcon />
      </Button>
    </div>
  )
}
