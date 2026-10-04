const collator = new Intl.Collator("es", { sensitivity: "base", numeric: true });

/** Letras del índice en orden español, con Ñ. */
export const INDEX_LETTERS = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
export const OTHER_LETTER = "#";

/** Inicial para el índice: quita tildes (Á → A) pero respeta la Ñ. */
export function indexLetter(name: string): string {
  const first = name.trim().charAt(0);
  if (!first) return OTHER_LETTER;
  const upper = first.toLocaleUpperCase("es");
  if (upper === "Ñ") return "Ñ";
  const base = upper.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  return INDEX_LETTERS.includes(base) ? base : OTHER_LETTER;
}

export type IndexGroup<T> = { letter: string; items: T[] };

/** Agrupa por inicial y ordena como un índice de libro en español. */
export function groupByInitial<T extends { name: string }>(items: readonly T[]): IndexGroup<T>[] {
  const sorted = [...items].sort((a, b) => collator.compare(a.name, b.name));
  const groups = new Map<string, T[]>();
  for (const item of sorted) {
    const letter = indexLetter(item.name);
    groups.set(letter, [...(groups.get(letter) ?? []), item]);
  }
  const order = [...INDEX_LETTERS, OTHER_LETTER];
  return order.filter((l) => groups.has(l)).map((letter) => ({ letter, items: groups.get(letter)! }));
}
