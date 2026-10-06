import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { colorGroups, typeScale } from '@/lib/design-tokens'

export const metadata: Metadata = {
  title: 'Design system',
  robots: { index: false, follow: false },
}

/**
 * Development-only token reference. Production builds return 404: the design system
 * lives in Storybook (`pnpm storybook`), see docs/PLAN.md §7.
 */
export default function DesignSystemPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 tablet:px-7">
      <h1 className="font-display text-page-title font-semibold text-ink">Design system</h1>
      <p className="mt-1 text-body text-muted">
        Referência rápida dos tokens. A documentação completa dos componentes fica no Storybook (
        <code className="font-mono">pnpm storybook</code>).
      </p>

      {colorGroups.map((group, index) => (
        <section key={group.title} className="mt-8" aria-labelledby={`color-group-${index}`}>
          <h2
            id={`color-group-${index}`}
            className="font-display text-card-title font-semibold text-ink"
          >
            {group.title}
          </h2>
          <ul className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
            {group.tokens.map((token) => (
              <li
                key={token.name}
                className="overflow-hidden rounded-card border border-line bg-surface shadow-card"
              >
                <div className="h-14 border-b border-line" style={{ background: token.hex }} />
                <div className="p-3">
                  <p className="font-mono text-label text-ink">{token.name}</p>
                  <p className="font-mono text-label text-muted">{token.hex}</p>
                  <p className="mt-1 text-label text-ink-2">{token.usage}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="mt-8" aria-labelledby="type-scale">
        <h2 id="type-scale" className="font-display text-card-title font-semibold text-ink">
          Tipografia
        </h2>
        <ul className="mt-3 divide-y divide-line-soft rounded-card border border-line bg-surface shadow-card">
          {typeScale.map((type) => (
            <li key={type.name} className="flex flex-col gap-1 p-4">
              <span className="text-label text-muted">
                {type.name} · {type.spec}
              </span>
              <span className={`text-ink ${type.className}`}>{type.sample}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
