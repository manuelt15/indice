import type { Metadata } from "next"
import { Privacy } from "@/features/legal/privacy"

export const metadata: Metadata = { title: "Privacidad · índice" }

export default function PrivacidadPage() {
  return <Privacy />
}
