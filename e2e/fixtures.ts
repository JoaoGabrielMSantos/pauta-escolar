import AxeBuilder from '@axe-core/playwright'
import { test as base } from '@playwright/test'

/** WCAG 2.2 AA rule set used on every screen (docs/PLAN.md §7, "Accessibility"). */
export const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] as const

interface Fixtures {
  makeAxeBuilder: () => AxeBuilder
}

export const test = base.extend<Fixtures>({
  makeAxeBuilder: async ({ page }, use) => {
    await use(() => new AxeBuilder({ page }).withTags([...AXE_TAGS]))
  },
})

export { expect } from '@playwright/test'
