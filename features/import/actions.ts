"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { importBookmarks, type ImportSummary } from "@/lib/dal/import"
import { requireOnboardedUser } from "@/lib/session"

export type ImportResult = { ok: true; summary: ImportSummary } | { ok: false; error: string }

/** Importa los marcadores ya leídos en el navegador. El servidor vuelve a validar cada entrada. */
export async function importBookmarksAction(items: unknown): Promise<ImportResult> {
  const user = await requireOnboardedUser()
  try {
    const summary = await importBookmarks(db, user.id, items, Date.now(), user.name)
    revalidatePath("/app")
    return { ok: true, summary }
  } catch {
    return { ok: false, error: "No hemos podido importar el archivo. Comprueba que es el que exporta tu navegador e inténtalo de nuevo." }
  }
}
