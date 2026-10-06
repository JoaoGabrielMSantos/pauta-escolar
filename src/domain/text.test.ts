import { describe, expect, it } from 'vitest'

import { removeDiacritics } from './text'

describe('removeDiacritics', () => {
  it.each([
    ['Botânico', 'Botanico'],
    ['Conceição', 'Conceicao'],
    ['Uchôa', 'Uchoa'],
    ['ÁÉÍÓÚ àèìòù ãõ ç', 'AEIOU aeiou ao c'],
    ['sem acento', 'sem acento'],
  ])('%s → %s', (input, expected) => {
    expect(removeDiacritics(input)).toBe(expected)
  })

  it('handles text that is already decomposed', () => {
    expect(removeDiacritics('Uchôa'.normalize('NFD'))).toBe('Uchoa')
  })
})
