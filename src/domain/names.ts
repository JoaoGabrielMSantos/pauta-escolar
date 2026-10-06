/**
 * Tones for deterministic avatar colors, in the prototype's palette order
 * (`cores` in the handoff: primary, petrol, warning, violet, danger, ink-2).
 */
export const AVATAR_TONES = ['primary', 'petrol', 'warning', 'violet', 'danger', 'ink-2'] as const

export type AvatarTone = (typeof AVATAR_TONES)[number]

/**
 * Initials shown in avatars and school badges (prototype `ini`): the first letter of
 * the first two words longer than two characters, so short connectors ("de", "da",
 * "e") are skipped.
 *
 * - "Ana Beatriz Rocha Lima" → "AB"
 * - "Cláudio Emídio Santana" → "CE"
 * - "Maria de Lourdes" → "ML"
 *
 * When no word qualifies, falls back to the first two letters or digits ("E. M." → "EM").
 */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/)
  const qualifying = words.filter((word) => word.length > 2).slice(0, 2)

  if (qualifying.length > 0) {
    return qualifying.map((word) => word.charAt(0).toLocaleUpperCase('pt-BR')).join('')
  }

  return name
    .replace(/[^\p{L}\p{N}]/gu, '')
    .slice(0, 2)
    .toLocaleUpperCase('pt-BR')
}

/**
 * Deterministic avatar tone for a name (prototype `corDe`: length modulo palette size),
 * so the same person always gets the same color across screens.
 */
export function avatarTone(name: string): AvatarTone {
  const index = name.normalize('NFC').length % AVATAR_TONES.length
  // The modulo keeps `index` inside the tuple, so the element always exists.
  return AVATAR_TONES[index] as AvatarTone
}
