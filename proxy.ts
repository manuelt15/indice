import { createHash, randomBytes } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { themeInitScript } from "@/lib/theme"

const themeHash = createHash("sha256").update(themeInitScript).digest("base64")

export function proxy(request: NextRequest) {
  const nonce = randomBytes(16).toString("base64")
  const isDev = process.env.NODE_ENV === "development"
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'sha256-${themeHash}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // En desarrollo, Turbopack inyecta el CSS sin nonce (y con nonce el navegador ignora 'unsafe-inline').
    isDev ? "style-src 'self' 'unsafe-inline'" : `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self'${isDev ? " ws:" : ""}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ")

  const headers = new Headers(request.headers)
  headers.set("Content-Security-Policy", policy)
  headers.set("x-nonce", nonce)
  const response = NextResponse.next({ request: { headers } })
  response.headers.set("Content-Security-Policy", policy)
  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|icon.svg|favicon.ico).*)"],
}
