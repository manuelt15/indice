import { describe, expect, it } from "vitest";
import { glyphBar, heatLevel } from "@/lib/glyphs";

describe("glyphBar", () => {
  it("rellena en proporción al máximo", () => {
    expect(glyphBar(5, 10, 10)).toEqual({ filled: "█████", empty: "░░░░░" });
  });

  it("no se sale de los límites", () => {
    expect(glyphBar(20, 10, 4)).toEqual({ filled: "████", empty: "" });
    expect(glyphBar(-3, 10, 4)).toEqual({ filled: "", empty: "░░░░" });
    expect(glyphBar(3, 0, 4)).toEqual({ filled: "", empty: "░░░░" });
  });
});

describe("heatLevel", () => {
  it("devuelve 0 sin actividad y 4 en el máximo", () => {
    expect(heatLevel(0, 8)).toBe(0);
    expect(heatLevel(8, 8)).toBe(4);
  });

  it("reparte los valores intermedios en cuartos", () => {
    expect(heatLevel(1, 8)).toBe(1);
    expect(heatLevel(3, 8)).toBe(2);
    expect(heatLevel(5, 8)).toBe(3);
  });
});
