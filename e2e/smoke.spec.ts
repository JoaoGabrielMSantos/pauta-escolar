import { expect, test } from './fixtures'

test.describe('smoke', () => {
  test('home renders in pt-BR with no accessibility violations', async ({
    page,
    makeAxeBuilder,
  }) => {
    await page.goto('/')

    await expect(page).toHaveTitle('Pauta Escolar')
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'O diário de classe da sua escola, organizado e auditável.',
      }),
    ).toBeVisible()

    const results = await makeAxeBuilder().analyze()
    expect(results.violations).toEqual([])
  })

  test('sends the baseline security headers', async ({ request }) => {
    const response = await request.get('/')
    const headers = response.headers()

    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['strict-transport-security']).toContain('max-age=')
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(headers['x-powered-by']).toBeUndefined()
  })

  test('the dev-only design-system route does not exist in production', async ({ page }) => {
    const response = await page.goto('/dev/design-system')
    expect(response?.status()).toBe(404)
  })
})
