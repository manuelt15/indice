"use client"

import * as React from "react"
import { DesktopIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { cn } from "cn"
import { THEME_STORAGE_KEY, isThemeMode, resolveDark, type ThemeMode } from "@/lib/theme"

const OPTIONS: { mode: ThemeMode; label: string; Icon: typeof SunIcon }[] = [
  { mode: "system", label: "Tema del sistema", Icon: DesktopIcon },
  { mode: "light", label: "Tema claro", Icon: SunIcon },
  { mode: "dark", label: "Tema oscuro", Icon: MoonIcon },
]

function readStoredMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeMode(stored) ? stored : "system"
  } catch {
    return "system"
  }
}

const THEME_EVENT = "indice-theme-change"

function applyMode(mode: ThemeMode) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  document.documentElement.classList.toggle("dark", resolveDark(mode, prefersDark))
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange)
  window.addEventListener(THEME_EVENT, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(THEME_EVENT, onChange)
  }
}

/** Selector de tema: sistema, claro u oscuro. Se recuerda en este navegador. */
function ThemeToggle({ className }: { className?: string }) {
  const mode = React.useSyncExternalStore(subscribe, readStoredMode, () => "system" as ThemeMode)

  React.useEffect(() => {
    if (mode !== "system") return
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => applyMode("system")
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [mode])

  function choose(next: ThemeMode) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Sin almacenamiento disponible: el tema se aplica solo en esta visita.
    }
    applyMode(next)
    window.dispatchEvent(new Event(THEME_EVENT))
  }

  return (
    <div role="radiogroup" aria-label="Tema" className={cn("flex rounded-lg border border-dotted border-border", className)}>
      {OPTIONS.map(({ mode: option, label, Icon }) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={mode === option}
          aria-label={label}
          title={label}
          onClick={() => choose(option)}
          className="grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground aria-checked:bg-secondary aria-checked:text-foreground"
        >
          <Icon aria-hidden />
        </button>
      ))}
    </div>
  )
}

export { ThemeToggle }
