import "server-only"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { emailOTP } from "better-auth/plugins/email-otp"
import { db } from "@/db"
import * as schema from "@/db/schema"
import { env } from "@/lib/env"

const isProduction = process.env.NODE_ENV === "production"

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.BETTER_AUTH_URL],
  database: drizzleAdapter(db, { provider: "pg", schema }),

  // Sin contraseñas: solo Google, GitHub y código por correo.
  emailAndPassword: { enabled: false },

  socialProviders: {
    google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET },
    github: { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET },
  },

  user: {
    additionalFields: {
      // input: false impide que el cliente los fije al registrarse; se editan desde el servidor.
      city: { type: "string", required: false, input: false },
      cityLat: { type: "number", required: false, input: false },
      cityLng: { type: "number", required: false, input: false },
      onboardedAt: { type: "date", required: false, input: false },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 días, como dice la política de privacidad
    updateAge: 60 * 60 * 24,
  },

  // Límite de peticiones guardado en la base de datos: funciona entre instancias serverless.
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 60,
    customRules: {
      "/email-otp/send-verification-otp": { window: 60 * 10, max: 3 },
      "/sign-in/email-otp": { window: 60 * 10, max: 10 },
    },
  },

  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 60 * 10,
      allowedAttempts: 5,
      storeOTP: "hashed",
      async sendVerificationOTP({ email, otp }) {
        if (isProduction) {
          // Hasta configurar el servicio de correo (pendiente: Resend), no se envían códigos en producción.
          throw new Error("El envío de códigos por correo aún no está configurado.")
        }
        // Solo en desarrollo: el código aparece en la consola del servidor, nunca en el navegador.
        console.info(`[índice] Código de acceso para ${email}: ${otp}`)
      },
    }),
    nextCookies(), // Debe ir el último.
  ],
})

export type Session = typeof auth.$Infer.Session
