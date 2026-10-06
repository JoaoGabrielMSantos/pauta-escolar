import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { typeScale } from '@/lib/design-tokens'

const meta = {
  title: 'Foundations/Typography',
  parameters: {
    docs: {
      description: {
        component:
          'Sora (display), Instrument Sans (interface) e IBM Plex Mono (dados), via `next/font`. Notas, matrículas, datas e códigos usam sempre a mono com `tabular-nums`.',
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Scale: Story = {
  render: () => (
    <ul className="flex max-w-4xl flex-col divide-y divide-line-soft rounded-card border border-line bg-surface shadow-card">
      {typeScale.map((type) => (
        <li key={type.name} className="flex flex-col gap-1.5 p-5">
          <span className="text-label text-muted">
            {type.name} · {type.spec}
          </span>
          <span className={`text-ink ${type.className}`}>{type.sample}</span>
        </li>
      ))}
    </ul>
  ),
}

export const Families: Story = {
  render: () => (
    <div className="grid max-w-4xl gap-4 tablet:grid-cols-3">
      {[
        { label: 'Display', className: 'font-display', name: 'Sora' },
        { label: 'Interface', className: 'font-sans', name: 'Instrument Sans' },
        { label: 'Dados', className: 'font-mono', name: 'IBM Plex Mono' },
      ].map((family) => (
        <div
          key={family.label}
          className="rounded-card border border-line bg-surface p-5 shadow-card"
        >
          <p className="text-label text-muted">{family.label}</p>
          <p className={`mt-2 text-[28px] text-ink ${family.className}`}>{family.name}</p>
          <p className={`mt-2 text-body text-ink-2 ${family.className}`}>
            Aa Bb Çç Ãã Éé 0123456789 · 6,5 · 22/09
          </p>
        </div>
      ))}
    </div>
  ),
}
