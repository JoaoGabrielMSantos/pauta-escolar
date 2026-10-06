import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { motion } from '@/lib/design-tokens'

import { TokenTable } from './TokenTable'

const meta = {
  title: 'Foundations/Motion',
  parameters: {
    docs: {
      description: {
        component:
          'Tempos e curvas do handoff. Com `prefers-reduced-motion: reduce`, só a opacidade anima (deslocamentos, escala, contagem dos KPIs e shimmer são desligados). A implementação com Motion chega no M3.',
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Timings: Story = {
  render: () => <TokenTable tokens={motion} />,
}

function OpenCloseDemo() {
  const [open, setOpen] = useState(true)

  return (
    <div className="flex max-w-md flex-col gap-4">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value)
        }}
        className="min-h-11 self-start rounded-control bg-primary px-4 py-2.5 text-[13px] font-medium text-white shadow-primary hover:bg-primary-hover"
      >
        {open ? 'Fechar (140ms)' : 'Abrir (220ms)'}
      </button>
      <div
        aria-hidden={!open}
        className={`rounded-modal border border-line bg-surface p-5 shadow-modal motion-reduce:transform-none ${
          open
            ? 'translate-y-0 scale-100 opacity-100 duration-220 ease-out-expo'
            : 'translate-y-1.5 scale-96 opacity-0 duration-140 ease-in-fast'
        } transition-[opacity,transform]`}
      >
        <p className="font-display text-card-title font-semibold text-ink">Diálogo</p>
        <p className="mt-1 text-body text-muted">
          Abre com scale 0.96 + translateY 6px em 220ms; fecha mais rápido do que abre.
        </p>
      </div>
    </div>
  )
}

export const OpenClose: Story = {
  name: 'Open / close',
  render: () => <OpenCloseDemo />,
}
