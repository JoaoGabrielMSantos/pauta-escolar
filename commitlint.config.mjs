/**
 * Conventional Commits in English (docs/PLAN.md §9).
 * Examples: `feat(grades): lock grades after term closing`, `fix(auth): …`, `chore(deps): …`.
 *
 * @type {import('@commitlint/types').UserConfig}
 */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
  },
}

export default config
