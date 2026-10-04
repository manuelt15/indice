import { describe, expect, it } from "vitest"
import { classifyLink } from "@/lib/classify"

const cases: [string, string, string | null][] = [
  ["https://ui.shadcn.com/", "shadcn/ui - The Foundation for your Design System", "UI"],
  ["https://uiverse.io/", "Uiverse | The Largest Library of Open-Source UI elements", "UI"],
  ["https://example.com/blocks", "Pro blocks and templates for React", "UI"],
  ["https://mobbin.com/", "Mobbin: UI & UX design inspiration", "Diseño"],
  ["https://fontpair.co/all", "All Font Pairings", "Diseño"],
  ["https://vercel.com/design/guidelines", "Web Interface Guidelines", "Diseño"],
  ["https://developer.apple.com/design/human-interface-guidelines", "Human Interface Guidelines", "Diseño"],
  ["https://ollama.com/search", "Ollama", "IA"],
  ["https://huggingface.co/tasks", "Tasks - Hugging Face", "IA"],
  ["https://www.skills.sh/", "The Agent Skills Directory", "IA"],
  ["https://www.mongodb.com/docs/manual/", "Install MongoDB Community Edition", "Dev"],
  ["https://vercel.com/mi-equipo", "Vercel", "Dev"],
  ["https://exercism.org/tracks/javascript", "JavaScript on Exercism", "Aprender"],
  ["https://learn-anything.xyz/", "Learn Anything", "Aprender"],
  ["https://github.com/alguien", "alguien", "Personal"],
  ["https://www.linkedin.com/in/alguien/", "Alguien | LinkedIn", "Personal"],
  ["https://account.protonvpn.com/es-es/login", "Proton VPN: Iniciar sesión", "Personal"],
  ["https://haveibeenpwned.com/", "Have I Been Pwned", "Personal"],
  ["https://example.org/", "Algo sin pistas", null],
]

describe("classifyLink", () => {
  it.each(cases)("%s → %s", (url, title, expected) => {
    expect(classifyLink({ url, title })?.category ?? null).toBe(expected)
  })

  it("reconoce la web personal por el nombre del usuario", () => {
    expect(classifyLink({ url: "https://www.ana-garcia.dev/", title: "Ana García", ownerName: "Ana García" })?.category).toBe("Personal")
  })

  it("explica por qué", () => {
    expect(classifyLink({ url: "https://ollama.com/", title: "Run LLM models" })?.reasons).toContain("ollama.com")
  })

  it("no falla con URLs inválidas", () => {
    expect(classifyLink({ url: "no es url" })).toBeNull()
  })
})
