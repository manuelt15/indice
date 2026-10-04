import { eq } from "drizzle-orm"
import { z } from "zod"
import { user } from "@/db/schema"
import type { Db } from "@/lib/dal/types"
import { cityOption } from "@/lib/geo"

export const profileInput = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Escribe tu nombre.")
    .max(40, "Como máximo 40 caracteres.")
    .refine((v) => !/[\u0000-\u001f\u007f<>]/.test(v), "El nombre tiene caracteres no permitidos."),
  city: cityOption.nullable(),
})

export const onboardingInput = profileInput.extend({
  acceptTerms: z.literal(true, "Para continuar, confirma que tienes 14 años o más y aceptas los términos."),
})

export type ProfileInput = z.input<typeof profileInput>
export type OnboardingInput = z.input<typeof onboardingInput>

function cityFields(city: z.output<typeof profileInput>["city"]) {
  return {
    city: city?.name ?? null,
    cityCountry: city?.countryCode ?? null,
    cityLat: city?.lat ?? null,
    cityLng: city?.lng ?? null,
  }
}

/** Perfil del usuario. Solo actualiza la fila del propio usuario (userId viene de la sesión). */
export function profileRepo(db: Db) {
  return {
    async completeOnboarding(userId: string, input: OnboardingInput) {
      if (!userId) throw new Error("Falta el usuario.")
      const data = onboardingInput.parse(input)
      const [row] = await db
        .update(user)
        .set({ name: data.name, ...cityFields(data.city), onboardedAt: new Date(), termsAcceptedAt: new Date() })
        .where(eq(user.id, userId))
        .returning({ id: user.id })
      if (!row) throw new Error("No se encontró el usuario.")
      return row
    },

    /** Cuentas creadas antes de pedir la aceptación: la registran una vez. */
    async acceptTerms(userId: string) {
      if (!userId) throw new Error("Falta el usuario.")
      await db.update(user).set({ termsAcceptedAt: new Date() }).where(eq(user.id, userId))
    },

    /** Rectificación: nombre y ciudad desde Ajustes. */
    async update(userId: string, input: ProfileInput) {
      if (!userId) throw new Error("Falta el usuario.")
      const data = profileInput.parse(input)
      const [row] = await db
        .update(user)
        .set({ name: data.name, ...cityFields(data.city) })
        .where(eq(user.id, userId))
        .returning({ id: user.id })
      if (!row) throw new Error("No se encontró el usuario.")
      return row
    },
  }
}
