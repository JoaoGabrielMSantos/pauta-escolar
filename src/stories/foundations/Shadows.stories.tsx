import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { shadows } from '@/lib/design-tokens'

import { TokenTable } from './TokenTable'

const meta = {
  title: 'Foundations/Shadows',
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const shadowClass: Record<string, string> = {
  'shadow-card': 'shadow-card',
  'shadow-primary': 'shadow-primary bg-primary',
  'shadow-modal': 'shadow-modal',
  'shadow-panel': 'shadow-panel',
  'shadow-segment': 'shadow-segment',
  'shadow-focus': 'shadow-focus border-primary',
}

export const Elevation: Story = {
  render: () => (
    <TokenTable
      tokens={shadows}
      preview={(token) => (
        <span
          aria-hidden="true"
          className={`block h-10 w-16 rounded-control border border-line bg-surface ${shadowClass[token.name] ?? ''}`}
        />
      )}
    />
  ),
}
