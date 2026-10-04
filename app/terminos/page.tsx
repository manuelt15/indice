import type { Metadata } from "next"
import { Terms } from "@/features/legal/terms"

export const metadata: Metadata = { title: "Términos · índice" }

export default function TerminosPage() {
  return <Terms />
}
