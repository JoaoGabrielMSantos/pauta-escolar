import { describe, expect, it } from 'vitest'

import { RESERVED_TENANT_CODES, suggestTenantCode, validateTenantCode } from './codes'

describe('suggestTenantCode', () => {
  it.each([
    ['Escola Municipal Jardim Botânico', 'SP', 'emjb-sp'],
    ['Colégio Estadual Vila Rica', 'MG', 'cevr-mg'],
    ['Escola Municipal Rio Claro', 'sp', 'emrc-sp'],
    ['Instituto Educar Norte', 'PA', 'ien-pa'],
    ['Escola Estadual Professora Aurora Dias da Conceição', 'BA', 'eepadc-ba'],
  ])('%s / %s → %s', (name, uf, expected) => {
    expect(suggestTenantCode(name, uf)).toBe(expected)
  })

  it('drops connectors (de, da, do, dos, das, e)', () => {
    expect(suggestTenantCode('Colégio das Flores e do Mar', 'RJ')).toBe('cfm-rj')
  })

  it('keeps at most 6 initials', () => {
    expect(suggestTenantCode('Alfa Beta Gama Delta Épsilon Zeta Eta Teta', 'SC')).toBe('abgdez-sc')
  })

  it('omits the UF part when it is missing or blank', () => {
    expect(suggestTenantCode('Colégio Horizonte')).toBe('ch')
    expect(suggestTenantCode('Colégio Horizonte', '  ')).toBe('ch')
  })

  it('sanitizes the UF and never produces a leading hyphen', () => {
    expect(suggestTenantCode('Colégio Horizonte', ' P.R ')).toBe('ch-pr')
    expect(suggestTenantCode('', 'SP')).toBe('sp')
    expect(suggestTenantCode('', undefined)).toBe('')
  })
})

describe('validateTenantCode', () => {
  it('accepts a well-formed code, normalizing case and spaces', () => {
    expect(validateTenantCode('  EMJB-SP ')).toEqual({ ok: true, code: 'emjb-sp' })
    expect(validateTenantCode('escola-123')).toEqual({ ok: true, code: 'escola-123' })
  })

  it('rejects an empty value', () => {
    expect(validateTenantCode('   ')).toEqual({ ok: false, code: '', reason: 'empty' })
  })

  it.each(['ab', 'a'.repeat(21), 'emjb_sp', 'emjb sp', 'escola.sp', 'açaí'])(
    'rejects %s by format',
    (input) => {
      expect(validateTenantCode(input)).toMatchObject({ ok: false, reason: 'format' })
    },
  )

  it.each(['-emjb', 'emjb-', 'xn--abc'])(
    'rejects %s because it is not a safe DNS label',
    (input) => {
      expect(validateTenantCode(input)).toMatchObject({ ok: false, reason: 'format' })
    },
  )

  it('rejects the current code', () => {
    expect(validateTenantCode('emjb-sp', { current: 'EMJB-SP' })).toEqual({
      ok: false,
      code: 'emjb-sp',
      reason: 'unchanged',
    })
    expect(validateTenantCode('emjb-rj', { current: 'emjb-sp' })).toEqual({
      ok: true,
      code: 'emjb-rj',
    })
  })

  it('rejects every reserved platform code', () => {
    for (const reserved of RESERVED_TENANT_CODES) {
      expect(validateTenantCode(reserved)).toMatchObject({ ok: false, reason: 'reserved' })
    }
  })
})
