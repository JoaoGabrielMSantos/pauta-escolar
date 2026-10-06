# Contributing

Thanks for your interest! This document describes how the project is developed. Read [`docs/PLAN.md`](docs/PLAN.md) and the [ADRs](docs/adr/README.md) before larger changes.

## Prerequisites

- **Node.js 24 LTS** (see `.nvmrc`)
- **pnpm 12** (`npm i -g pnpm`)
- **Docker**, for the local Supabase stack (from M1)

## Getting started

```bash
pnpm install
pnpm dev                 # http://localhost:3000
```

| Script                                    | What it does                                                |
| ----------------------------------------- | ----------------------------------------------------------- |
| `pnpm dev`                                | Next.js dev server (Turbopack)                              |
| `pnpm build` / `pnpm start`               | Production build and server                                 |
| `pnpm lint` / `pnpm lint:fix`             | ESLint with zero warnings allowed                           |
| `pnpm format` / `pnpm format:check`       | Prettier (with Tailwind class sorting)                      |
| `pnpm typecheck`                          | Route type generation + `tsc --noEmit`                      |
| `pnpm test` / `pnpm test:coverage`        | Vitest. `src/domain` must stay at 100% coverage             |
| `pnpm e2e`                                | Playwright + axe at 390/768/1280 px. Run `pnpm build` first |
| `pnpm storybook` / `pnpm storybook:build` | Design system documentation                                 |
| `pnpm lhci`                               | Lighthouse CI against the production build                  |
| `pnpm db:start` / `pnpm db:stop`          | Local Supabase stack (Docker)                               |

## Language

- Code, identifiers, database objects, commits and technical docs are in **English**.
- Everything the user sees (UI copy, emails, PDFs, URL slugs) is in **Brazilian Portuguese**, exactly as in the design handoff.

## Branches, commits and pull requests

- `main` is protected: no direct pushes, every change goes through a pull request with green CI, and PRs are **squash-merged**.
- Branch names: `feat/m1-schema-rls`, `fix/attendance-keyboard`, `chore/deps-…`.
- Commit messages follow **Conventional Commits** and are validated by commitlint. Examples: `feat(grades): lock grades after term closing`, `fix(auth): …`.
- Keep commits small and atomic: one logical change each.
- **The PR title is the squash commit on `main`**, so it must also be a Conventional Commit. It drives release-please and the CHANGELOG.
- Fill in the PR template: what and why, screenshots, checklist, how to test.

## Quality bar

- **Business rules** live in `src/domain` as pure functions with 100% test coverage.
- **UI** follows the tokens and components of the design system. Never hardcode colors or sizes: compare each screen with the prototype at 390, 768 and 1280 px.
- **States:** every data screen has loading (skeleton), empty, error and success states.
- **Accessibility:** WCAG 2.2 AA, full keyboard support, zero axe violations.
- **Security:** read the non-negotiable rules in `CLAUDE.md` (RLS everywhere, no service key on the client, critical rules enforced in the database).

## Database migrations

- Create migrations with `pnpm supabase migration new <name>`.
- A migration is **immutable once merged**. Fix mistakes with a new migration.
- Every new table needs `tenant_id`, RLS, policies, indexes and pgTAP isolation tests.

## Dependencies

- Versions are pinned exactly.
- pnpm and Dependabot never install or propose a release younger than **7 days** (supply-chain quarantine).
- Do not add a dependency without a clear need. Prefer what the stack already provides.
