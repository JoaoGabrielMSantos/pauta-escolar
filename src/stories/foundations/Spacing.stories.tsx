import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { radii, spacing } from '@/lib/design-tokens'

import { TokenTable } from './TokenTable'

const meta = {
  title: 'Foundations/Spacing & radii',
  parameters: {
    docs: {
      description: {
        component:
          'Grade de 4px. Alvo de toque mínimo de 44px em botões, inputs, selects e itens de navegação (chips de filtro 36px; ações inline 32px no desktop).',
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Spacing: Story = {
  render: () => <TokenTable tokens={spacing} />,
}

const radiusClass: Record<string, string> = {
  'rounded-card': 'rounded-card',
  'rounded-modal': 'rounded-modal',
  'rounded-sheet': 'rounded-sheet',
  'rounded-control': 'rounded-control',
  'rounded-grade': 'rounded-grade',
  'rounded-chip': 'rounded-chip',
}

export const Radii: Story = {
  render: () => (
    <TokenTable
      tokens={radii}
      preview={(token) => (
        <span
          aria-hidden="true"
          className={`block h-16 w-24 border border-primary-tint-border bg-primary-tint ${radiusClass[token.name] ?? ''}`}
        />
      )}
    />
  ),
}
