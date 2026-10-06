import { describe, expect, it } from 'vitest'

import { AVATAR_TONES, avatarTone, initials } from './names'

describe('initials', () => {
  it.each([
    ['Ana Beatriz Rocha Lima', 'AB'],
    ['Cláudio Emídio Santana', 'CE'],
    ['Maria de Lourdes', 'ML'],
    ['Ivone Barbosa Freitas', 'IB'],
    ['  Danilo   Ferraz  Uchôa ', 'DF'],
    ['Sistema', 'S'],
    ['érica ávila', 'ÉÁ'],
  ])('%s → %s', (name, expected) => {
    expect(initials(name)).toBe(expected)
  })

  it('falls back to the first two letters or digits when no word is long enough', () => {
    expect(initials('E. M.')).toBe('EM')
    expect(initials('Jo')).toBe('JO')
    expect(initials('6 A')).toBe('6A')
  })

  it('returns an empty string for an empty name', () => {
    expect(initials('')).toBe('')
    expect(initials('   ')).toBe('')
  })
})

describe('avatarTone', () => {
  it('follows the prototype rule: name length modulo the palette size', () => {
    // "Marlene Rocha" has 13 characters → 13 % 6 = 1 → petrol
    expect(avatarTone('Marlene Rocha')).toBe('petrol')
    // "Cristina Alves" has 14 characters → 14 % 6 = 2 → warning
    expect(avatarTone('Cristina Alves')).toBe('warning')
  })

  it('is deterministic and always returns a palette tone', () => {
    for (const name of ['', 'A', 'Ana', 'Cláudio Emídio Santana', 'x'.repeat(97)]) {
      const tone = avatarTone(name)
      expect(AVATAR_TONES).toContain(tone)
      expect(avatarTone(name)).toBe(tone)
    }
  })

  it('counts composed and decomposed accents the same way', () => {
    const composed = 'Uchôa'
    const decomposed = composed.normalize('NFD')
    expect(avatarTone(decomposed)).toBe(avatarTone(composed))
  })
})
