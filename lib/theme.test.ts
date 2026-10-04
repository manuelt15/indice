import { describe, expect, it } from "vitest";
import { isThemeMode, resolveDark } from "@/lib/theme";

describe("tema", () => {
  it("resuelve el modo sistema según la preferencia del navegador", () => {
    expect(resolveDark("system", true)).toBe(true);
    expect(resolveDark("system", false)).toBe(false);
  });

  it("una elección explícita gana a la preferencia del sistema", () => {
    expect(resolveDark("light", true)).toBe(false);
    expect(resolveDark("dark", false)).toBe(true);
  });

  it("rechaza valores guardados que no son un modo válido", () => {
    expect(isThemeMode("dark")).toBe(true);
    expect(isThemeMode("sepia")).toBe(false);
    expect(isThemeMode(null)).toBe(false);
  });
});
