import type { ReactNode } from 'react'

import type { ScalarToken } from '@/lib/design-tokens'

interface TokenTableProps {
  tokens: readonly ScalarToken[]
  /** Optional visual preview rendered for each token. */
  preview?: (token: ScalarToken) => ReactNode
}

/** Table used by the Foundations stories to document scalar tokens. */
export function TokenTable({ tokens, preview }: TokenTableProps) {
  return (
    <table className="w-full max-w-4xl border-separate border-spacing-0 overflow-hidden rounded-card border border-line bg-surface text-left shadow-card">
      <thead>
        <tr className="bg-surface-header">
          {preview ? (
            <th scope="col" className="w-24 p-3 text-table-head font-semibold text-muted uppercase">
              Amostra
            </th>
          ) : null}
          <th scope="col" className="p-3 text-table-head font-semibold text-muted uppercase">
            Token
          </th>
          <th scope="col" className="p-3 text-table-head font-semibold text-muted uppercase">
            Valor
          </th>
          <th scope="col" className="p-3 text-table-head font-semibold text-muted uppercase">
            Uso
          </th>
        </tr>
      </thead>
      <tbody>
        {tokens.map((token) => (
          <tr key={token.name}>
            {preview ? <td className="border-t border-line-soft p-3">{preview(token)}</td> : null}
            <td className="border-t border-line-soft p-3 font-mono text-label text-ink">
              {token.name}
            </td>
            <td className="border-t border-line-soft p-3 font-mono text-label text-ink-2">
              {token.value}
            </td>
            <td className="border-t border-line-soft p-3 text-body-sm text-ink-2">{token.usage}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
