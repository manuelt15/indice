import { eq } from "drizzle-orm"
import { z } from "zod"
import { user } from "@/db/schema"
import type { Db } from "@/lib/dal/types"
import { cityOption } from "@/lib/geo"

export const onboardingInput = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Escribe tu nombre.")
    .max(40, "Como máximo 40 caracteres.")
    .refine((v) => !/[\u0000-\u001f\u007f<>]/.test(v), "El nombre tiene caracteres no permitidos."),
  city: cityOption.nullable(),
})

export type OnboardingInput = z.input<typeof onboardingInput>

/** Perfil del usuario. Solo actualiza la fila del propio usuario (userId viene de la sesión). */
export function profileRepo(db: Db) {
  return {
    async completeOnboarding(userId: string, input: OnboardingInput) {
      if (!userId) throw new Error("Falta el usuario.")
      const data = onboardingInput.parse(input)
      const [row] = await db
        .update(user)
        .set({
          name: data.name,
          city: data.city?.name ?? null,
          cityCountry: data.city?.countryCode ?? null,
          cityLat: data.city?.lat ?? null,
          cityLng: data.city?.lng ?? null,
          onboardedAt: new Date(),
        })
        .where(eq(user.id, userId))
        .returning({ id: user.id })
      if (!row) throw new Error("No se encontró el usuario.")
      return row
    },
  }
}
