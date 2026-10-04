"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/db"
import { classifyLink } from "@/lib/classify"
import { categoriesRepo, categoryName } from "@/lib/dal/categories"
import { reorganizeLinks, type ReorganizeSummary } from "@/lib/dal/reorganize"
import { linksRepo } from "@/lib/dal/links"
import { extractTitle } from "@/lib/net/page-meta"
import { safeFetch } from "@/lib/net/safe-fetch"
import { requireOnboardedUser } from "@/lib/session"
import { httpUrl, tagList } from "@/lib/validation"
import type { ActionResult } from "@/features/library/types"

const id = z.string().min(1).max(64)

function isUniqueViolation(error: unknown): boolean {
  const e = error as { code?: string; cause?: { code?: string } } | null
  return e?.code === "23505" || e?.cause?.code === "23505"
}

export type LinkPreview =
  | { ok: true; title: string | null; host: string; suggestion: { category: string; reasons: string[] } | null }
  | { ok: false; error: string }

/** Lee el título de la página para proponer un nombre. Descarga segura (sin redes internas). */
export async function previewLinkAction(rawUrl: string): Promise<LinkPreview> {
  const user = await requireOnboardedUser()
  const parsed = httpUrl.safeParse(rawUrl)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "URL no válida." }
  const host = new URL(parsed.data).hostname.replace(/^www\./, "")
  try {
    const res = await safeFetch(parsed.data, { maxBytes: 256 * 1024, accept: "text/html", truncate: true })
    const title = res.contentType.includes("html") ? extractTitle(res.body.toString("utf8")) : null
    return { ok: true, title, host, suggestion: classifyLink({ url: parsed.data, title, ownerName: user.name }) }
  } catch {
    return { ok: true, title: null, host, suggestion: classifyLink({ url: parsed.data, ownerName: user.name }) }
  }
}

const addInput = z.object({
  url: httpUrl,
  name: z.string().trim().min(1, "Ponle un nombre.").max(200),
  categoryId: id.nullable(),
  newCategory: categoryName.nullable(),
  tags: tagList,
  pinned: z.boolean(),
})

export async function addLinkAction(input: z.input<typeof addInput>): Promise<ActionResult> {
  const user = await requireOnboardedUser()
  const parsed = addInput.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos." }
  const data = parsed.data
  try {
    const categoryId = data.newCategory ? (await categoriesRepo(db).ensure(user.id, data.newCategory)).id : data.categoryId
    await linksRepo(db).create(user.id, { url: data.url, name: data.name, categoryId, tags: data.tags, pinned: data.pinned })
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, error: "Ya tienes este enlace en tu índice." }
    return { ok: false, error: "No hemos podido guardar el enlace. Inténtalo de nuevo." }
  }
  revalidatePath("/app")
  return { ok: true }
}

export async function setPinnedAction(linkId: string, pinned: boolean): Promise<ActionResult> {
  const user = await requireOnboardedUser()
  if (!id.safeParse(linkId).success || typeof pinned !== "boolean") return { ok: false, error: "Petición no válida." }
  const done = await linksRepo(db).setPinned(user.id, linkId, pinned)
  if (!done) return { ok: false, error: "Ese enlace no existe." }
  revalidatePath("/app")
  return { ok: true }
}

export async function deleteLinkAction(linkId: string): Promise<ActionResult> {
  const user = await requireOnboardedUser()
  if (!id.safeParse(linkId).success) return { ok: false, error: "Petición no válida." }
  const done = await linksRepo(db).remove(user.id, linkId)
  if (!done) return { ok: false, error: "Ese enlace no existe." }
  revalidatePath("/app")
  return { ok: true }
}

export type ReorganizeResult = { ok: true; summary: ReorganizeSummary } | { ok: false; error: string }

/** Reclasifica todos los enlaces del usuario por reglas. */
export async function reorganizeAction(): Promise<ReorganizeResult> {
  const user = await requireOnboardedUser()
  try {
    const summary = await reorganizeLinks(db, user.id, user.name)
    revalidatePath("/app")
    return { ok: true, summary }
  } catch {
    return { ok: false, error: "No hemos podido reorganizar tus enlaces. Inténtalo de nuevo." }
  }
}
