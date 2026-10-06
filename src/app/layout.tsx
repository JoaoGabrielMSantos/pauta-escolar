import type { Metadata, Viewport } from 'next'

import { fontVariables } from '@/lib/fonts'

import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Pauta Escolar',
    template: '%s · Pauta Escolar',
  },
  description:
    'O diário de classe da sua escola, organizado e auditável. Secretaria, professores e famílias trabalhando sobre o mesmo registro.',
  applicationName: 'Pauta Escolar',
}

export const viewport: Viewport = {
  themeColor: '#f4f6fa',
  colorScheme: 'light',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={fontVariables}>
      <body>{children}</body>
    </html>
  )
}
