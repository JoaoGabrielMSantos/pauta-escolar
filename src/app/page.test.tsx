import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Home from './page'

describe('Home (provisional)', () => {
  it('renders the product headline in pt-BR inside the main landmark', () => {
    render(<Home />)

    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'O diário de classe da sua escola, organizado e auditável.',
      }),
    ).toBeInTheDocument()
  })
})
