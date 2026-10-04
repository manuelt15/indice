import type { Metadata } from "next"
import { LegalNotice } from "@/features/legal/legal-notice"

export const metadata: Metadata = { title: "Aviso legal · índice" }

export default function AvisoLegalPage() {
  return <LegalNotice />
}
