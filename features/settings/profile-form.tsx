"use client"

import * as React from "react"
import { CheckIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CityField } from "@/features/onboarding/city-field"
import { updateProfileAction } from "@/features/settings/actions"
import type { CityOption } from "@/lib/geo"

export function ProfileForm({ initialName, initialCity }: { initialName: string; initialCity: CityOption | null }) {
  const [name, setName] = React.useState(initialName)
  const [city, setCity] = React.useState<CityOption | null>(initialCity)
  const [status, setStatus] = React.useState<{ ok: boolean; message: string } | null>(null)
  const [pending, startTransition] = React.useTransition()

  function submit(event: React.FormEvent) {
    event.preventDefault()
    setStatus(null)
    startTransition(async () => {
      const result = await updateProfileAction({ name, city })
      setStatus(result.ok ? { ok: true, message: "Cambios guardados." } : { ok: false, message: result.error })
    })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" autoComplete="given-name" maxLength={40} required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <CityField city={city} onChange={setCity} />
      <div className="flex items-center justify-end gap-3">
        {status ? (
          <p role={status.ok ? "status" : "alert"} className={status.ok ? "text-sm text-muted-foreground" : "text-sm text-destructive"}>
            {status.message}
          </p>
        ) : null}
        <Button type="submit" disabled={pending}>
          <CheckIcon />
          Guardar
        </Button>
      </div>
    </form>
  )
}
