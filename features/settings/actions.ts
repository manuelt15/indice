"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { deleteAccount } from "@/lib/dal/account"
import { profileRepo, type ProfileInput } from "@/lib/dal/profile"
import { requireOnboardedUser, requireUser } from "@/lib/session"

export type SettingsResult = { ok: true } | { ok: false; error: string }

/** Rectificación: nombre y ciudad del usuario de la sesión. */
export async function updateProfileAction(input: ProfileInput): Promise<SettingsResult> {
  const user = await requireOnboardedUser()
  try {
    await profileRepo(db).update(user.id, input)
  } catch {
    return { ok: false, error: "No hemos podido guardar los cambios. Revisa el nombre y vuelve a intentarlo." }
  }
  revalidatePath("/", "layout")
  return { ok: true }
}

/**
 * Supresión: borra la cuenta y todo lo asociado. Hay que escribir "borrar" para confirmar.
 * Basta con tener sesión: quien no acepta los términos en la bienvenida también puede irse.
 */
export async function deleteAccountAction(confirmation: string): Promise<SettingsResult> {
  const user = await requireUser()
  if (typeof confirmation !== "string" || confirmation.trim().toLowerCase() !== "borrar") {
    return { ok: false, error: "Escribe «borrar» para confirmar." }
  }
  try {
    await deleteAccount(db, user.id)
  } catch {
    return { ok: false, error: "No hemos podido borrar la cuenta. Vuelve a intentarlo o escríbenos." }
  }
  // La sesión ya no existe en la base de datos; se limpian también sus cookies del navegador.
  const jar = await cookies()
  for (const { name } of jar.getAll()) {
    if (/^(__Secure-)?better-auth\./.test(name)) jar.delete(name)
  }
  redirect("/cuenta-borrada")
}
