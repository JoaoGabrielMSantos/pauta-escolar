import { removeDiacritics } from './text'

/** Tenant code format from the handoff ("Configurações → Código do tenant"). */
export const TENANT_CODE_PATTERN = /^[a-z0-9-]{3,20}$/

/**
 * Codes that can never be a school: they are hosts or routes of the platform itself
 * (docs/adr/0002-multi-tenancy.md §4). Mirrored by a database check constraint in M1.
 */
export const RESERVED_TENANT_CODES: ReadonlySet<string> = new Set([
  'admin',
  'api',
  'app',
  'assets',
  'blog',
  'demo',
  'docs',
  'mail',
  'plataforma',
  'static',
  'status',
  'www',
])

/** Connectors ignored when deriving a code from the school name (prototype wizard). */
const NAME_STOPWORDS: ReadonlySet<string> = new Set(['de', 'da', 'do', 'dos', 'das', 'e'])

const MAX_INITIALS = 6

/**
 * Suggests a tenant code from the school name and UF, as the "Nova escola" wizard does:
 * initials of the significant words (max 6) plus `-uf`.
 *
 * - "Escola Municipal Jardim Botânico", "SP" → "emjb-sp"
 * - "Colégio Estadual Vila Rica", "MG" → "cevr-mg"
 *
 * The suggestion is editable and must still pass {@link validateTenantCode}.
 */
export function suggestTenantCode(schoolName: string, uf?: string): string {
  const initialsPart = removeDiacritics(schoolName)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word !== '' && !NAME_STOPWORDS.has(word))
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, MAX_INITIALS)

  const ufPart = (uf ?? '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .slice(0, 2)

  return [initialsPart, ufPart].filter(Boolean).join('-')
}

export type TenantCodeRejection = 'empty' | 'format' | 'unchanged' | 'reserved'

export type TenantCodeValidation =
  { ok: true; code: string } | { ok: false; code: string; reason: TenantCodeRejection }

/**
 * Validates a new tenant code. Input is trimmed and lower-cased first, like the prototype.
 *
 * Besides `^[a-z0-9-]{3,20}$`, the code becomes a DNS label (`{code}.pauta.app`), so it
 * must not start or end with a hyphen nor contain `--` (reserved for punycode labels).
 */
export function validateTenantCode(
  input: string,
  options: { current?: string } = {},
): TenantCodeValidation {
  const code = input.trim().toLowerCase()

  if (code === '') return { ok: false, code, reason: 'empty' }

  const dnsSafe = !code.startsWith('-') && !code.endsWith('-') && !code.includes('--')
  if (!TENANT_CODE_PATTERN.test(code) || !dnsSafe) return { ok: false, code, reason: 'format' }

  if (code === options.current?.trim().toLowerCase()) {
    return { ok: false, code, reason: 'unchanged' }
  }

  if (RESERVED_TENANT_CODES.has(code)) return { ok: false, code, reason: 'reserved' }

  return { ok: true, code }
}
