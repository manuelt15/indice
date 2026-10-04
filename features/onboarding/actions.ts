"use server"

import { redirect } from "next/navigation"
import { db } from "@/db"
import { profileRepo, type OnboardingInput } from "@/lib/dal/profile"
import type { CityOption } from "@/lib/geo"
import { searchCities } from "@/lib/geo.server"
import { requireUser } from "@/lib/session"

/** Sugerencias de ciudad. Solo con sesión iniciada. */
export async function searchCitiesAction(query: string): Promise<CityOption[]> {
  await requireUser()
  if (typeof query !== "string") return []
  return searchCities(query)
}

export type OnboardingResult = { ok: false; error: string }

/** Guarda la bienvenida del usuario de la sesión y lo lleva a su índice. */
export async function completeOnboardingAction(
  input: OnboardingInput,
  next: "app" | "importar" = "app"
): Promise<OnboardingResult> {
  const user = await requireUser()
  try {
    await profileRepo(db).completeOnboarding(user.id, input)
  } catch {
    return { ok: false, error: "No hemos podido guardar tus datos. Revisa el nombre y vuelve a intentarlo." }
  }
  redirect(next === "importar" ? "/importar" : "/app")
}

/** Cuentas anteriores a la casilla de términos: la aceptan una vez y siguen a su índice. */
export async function acceptTermsAction(accepted: boolean): Promise<OnboardingResult> {
  const user = await requireUser()
  if (accepted !== true) return { ok: false, error: "Para continuar, confirma que tienes 14 años o más y aceptas los términos." }
  try {
    await profileRepo(db).acceptTerms(user.id)
  } catch {
    return { ok: false, error: "No hemos podido guardarlo. Vuelve a intentarlo." }
  }
  redirect("/app")
}
