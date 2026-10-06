/** Combining Diacritical Marks block (U+0300–U+036F), same range the prototype strips. */
const COMBINING_MARKS = /[̀-ͯ]/g

/**
 * Removes accents and cedillas: "Botânico" → "Botanico", "Conceição" → "Conceicao".
 * Used for codes, search keys and comparisons — never for display.
 */
export function removeDiacritics(value: string): string {
  return value.normalize('NFD').replace(COMBINING_MARKS, '')
}
