import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'domain',
          environment: 'node',
          include: ['src/domain/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'ui',
          environment: 'jsdom',
          include: ['src/**/*.test.tsx'],
          setupFiles: ['./vitest.setup.ts'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/*.stories.tsx', 'src/**/__fixtures__/**'],
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      thresholds: {
        // Business rules are 100% covered — non-negotiable (docs/PLAN.md §6).
        'src/domain/**': { 100: true, perFile: true },
      },
    },
  },
})
