/** Enlace tal como lo ve el navegador (sin userId ni datos internos). */
export type LinkView = {
  id: string
  name: string
  url: string
  host: string
  categoryId: string | null
  tags: string[]
  pinned: boolean
  createdAt: string
}

export type CategoryView = { id: string; name: string; count: number }

export type ActionResult = { ok: true } | { ok: false; error: string }
