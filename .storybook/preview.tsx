import type { Preview } from '@storybook/nextjs-vite'

import { fontVariables } from '../src/lib/fonts'

import '../src/app/globals.css'

// Same as the app's root layout: the next/font variables live on <html>, so portaled
// content (dialogs, sheets, toasts) gets the fonts too.
document.documentElement.classList.add(...fontVariables.split(' '))
document.documentElement.lang = 'pt-BR'

const preview: Preview = {
  parameters: {
    layout: 'padded',
    backgrounds: {
      options: {
        app: { name: 'Fundo da aplicação', value: '#F4F6FA' },
        surface: { name: 'Card', value: '#FFFFFF' },
        panel: { name: 'Painel escuro', value: '#0C1424' },
      },
    },
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    a11y: {
      // Accessibility violations fail story tests (WCAG 2.2 AA is non-negotiable).
      test: 'error',
    },
  },
  initialGlobals: {
    backgrounds: { value: 'app' },
  },
  decorators: [
    (Story) => (
      <div className="font-sans text-body text-ink">
        <Story />
      </div>
    ),
  ],
}

export default preview
