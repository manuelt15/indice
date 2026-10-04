import { describe, expect, it } from "vitest";
import { groupByInitial, indexLetter } from "@/lib/indexing";

describe("indexLetter", () => {
  it("quita tildes pero mantiene la Ñ", () => {
    expect(indexLetter("Álbum")).toBe("A");
    expect(indexLetter("ñandú")).toBe("Ñ");
  });

  it("manda números y símbolos al grupo #", () => {
    expect(indexLetter("37signals")).toBe("#");
    expect(indexLetter("  ")).toBe("#");
  });
});

describe("groupByInitial", () => {
  it("ordena como un índice español, con la Ñ después de la N", () => {
    const groups = groupByInitial([
      { name: "Ñu" },
      { name: "nextjs" },
      { name: "Ánfora" },
      { name: "abc" },
      { name: "1Password" },
    ]);
    expect(groups.map((g) => g.letter)).toEqual(["A", "N", "Ñ", "#"]);
    expect(groups[0].items.map((i) => i.name)).toEqual(["abc", "Ánfora"]);
  });
});
