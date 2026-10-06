import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { colorGroups } from '@/lib/design-tokens'

const meta = {
  title: 'Foundations/Colors',
  parameters: {
    docs: {
      description: {
        component:
          'Paleta da v2 (docs/design/README.md). Use sempre as utilities do Tailwind (`text-ink`, `bg-primary-tint`…) — nunca hex no componente. Status nunca depende só de cor: sempre ícone + texto.',
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Palette: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {colorGroups.map((group, index) => (
        <section key={group.title} aria-labelledby={`palette-${index}`}>
          <h2
            id={`palette-${index}`}
            className="mb-3 font-display text-card-title font-semibold text-ink"
          >
            {group.title}
          </h2>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3">
            {group.tokens.map((token) => (
              <li
                key={token.name}
                className="overflow-hidden rounded-card border border-line bg-surface shadow-card"
              >
                <div className="h-16 border-b border-line" style={{ background: token.hex }} />
                <div className="p-3">
                  <p className="font-mono text-label font-medium text-ink">{token.name}</p>
                  <p className="font-mono text-label text-muted">{token.hex}</p>
                  <p className="mt-1 text-label text-ink-2">{token.usage}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  ),
}

export const DarkPanel: Story = {
  name: 'Dark panel',
  render: () => (
    <div className="max-w-xl rounded-card bg-(image:--panel-gradient) p-8 text-panel-text">
      <p className="font-display text-card-title font-semibold">Painel escuro</p>
      <p className="mt-2 text-body text-panel-nav">
        Gradiente 185°, #14213A → #0C1424 → #080E1A. Usado no login, no primeiro acesso e (em 190°)
        na sidebar.
      </p>
      <p className="mt-4 flex items-center gap-2 text-label text-panel-muted">
        <span className="size-1.5 rounded-full bg-panel-accent shadow-[0_0_10px_rgb(46_197_165/0.9)]" />
        Item ativo da navegação
      </p>
    </div>
  ),
}
