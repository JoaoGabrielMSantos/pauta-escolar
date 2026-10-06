# ADR-0001: Technology stack and version policy

- Status: Accepted (2026-10-06)
- Date: 2026-10-06
- Deciders: owner, engineer
- Related: spec §4.1, §6; [PLAN §2, §8](../PLAN.md)

## Context

Pauta Escolar has to reach commercial quality: secure multi-tenancy, offline attendance, PDFs, realtime, push notifications and strict accessibility. It also has to show modern, idiomatic engineering for a portfolio. Spec §4.1 prescribes most of the stack. This ADR does three things:

- records that stack;
- fixes the choices the spec left open: package manager, migration workflow, Storybook framework, lint configuration, Serwist integration mode;
- defines how versions are chosen and kept current.

Several of these tools changed recently in ways that affect the implementation. All of this was checked with Context7 on 2026-10-06:

- **Next.js 16** renamed `middleware.ts` to `proxy.ts`, which runs on the Node.js runtime. It also removed `next lint`.
- **`@supabase/ssr`** recommends the `getAll`/`setAll` cookie methods and `auth.getClaims()`. It also recommends the new publishable/secret API keys.
- **Serwist 9.4+** offers a "configurator mode" that works with Turbopack.

## Decision

### Runtime and tooling
- **Node.js 24 LTS**, pinned in `.nvmrc` and `package.json#engines`.
- **pnpm 10**: strict dependency resolution, a fast CI cache, a deterministic lockfile.

### Application
- **Next.js 16 (App Router, Turbopack)** on **React 19.2**.
  - `proxy.ts` handles tenant resolution and session refresh ([ADR-0002](0002-multi-tenancy.md)).
  - Server Components by default.
  - Server Actions for mutations, Route Handlers for PDFs, webhooks and file streams.
- **TypeScript (latest 5.x) in strict mode**, plus `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch` and `forceConsistentCasingInFileNames`.

### Backend: Supabase
- **Services:** Postgres, Auth, Storage, Realtime, Edge Functions (Deno), `pg_cron` and `pg_net`.
- **Clients:** `@supabase/ssr` and `@supabase/supabase-js`, using the **new API keys**:
  - the publishable key in the browser;
  - the secret key only in `server-only` modules.
- **Local stack:** the Supabase CLI is a **devDependency** (`pnpm supabase …`) and runs the stack locally on Docker.
- **Migrations:** hand-written **imperative SQL** (`supabase migration new`). We do not use declarative schemas.
  - RLS policies, grants, `security definer` functions, privileged roles and triggers are the core of our security model and must be explicit and reviewable line by line.
  - Schema-diff tooling does not reliably cover all of them.
- **Types:** generated with `supabase gen types typescript --local` into `src/lib/supabase/database.types.ts`. CI fails on drift.

### UI
- **Styling:** Tailwind CSS v4 (CSS-first `@theme`). The design tokens are CSS variables in `src/styles/tokens.css`.
- **Primitives:** shadcn/ui on **Radix**, as copied-in source. It provides behavior and accessibility (Dialog, AlertDialog, Sheet, Select, Popover, Tabs, Tooltip), and is restyled entirely with our tokens.
- **Icons:** `lucide-react`.
- **Fonts:** `next/font/google` for Sora, Instrument Sans and IBM Plex Mono, with `display: 'swap'`.
- **Motion:** `motion` (`motion/react`), wrapped by `src/lib/motion.ts` and a central `useReducedMotion` hook.

### Client data and forms
- TanStack Query v5, TanStack Table v8 and TanStack Virtual v3.
- React Hook Form with `@hookform/resolvers` and **Zod 4**.
- Zod schemas live in `src/schemas/` and are shared by client, server and Edge Functions. Edge Functions import them by relative path, with `zod` mapped in `deno.json`.

### Feature libraries
| Need | Library |
|---|---|
| Command palette | `cmdk` |
| Toasts | `sonner`, styled to the README |
| Dates (`America/Sao_Paulo`, `ptBR` locale) | `date-fns` v4 + `@date-fns/tz` |
| PDFs | `@react-pdf/renderer` (Node runtime route handler) |
| QR codes | `qrcode` |
| Email | `resend` + React Email (`@react-email/components`) |
| Service worker | Serwist: `@serwist/next` in configurator mode, falling back to `@serwist/turbopack` (re-checked at M8) |
| Error tracking | `@sentry/nextjs` |
| Web Push | Library chosen at M8, after a Context7 check of Deno compatibility |

### Quality tooling
| Area | Choice |
|---|---|
| Lint | ESLint 9 flat config via the ESLint CLI: `typescript-eslint` (strictTypeChecked + stylisticTypeChecked), `eslint-plugin-jsx-a11y`, `eslint-plugin-import-x`, `eslint-plugin-react-hooks`, `@next/eslint-plugin-next`, `eslint-plugin-storybook` |
| Format | Prettier 3 + `prettier-plugin-tailwindcss` |
| Unit tests | Vitest + `@vitest/coverage-v8` + Testing Library + jsdom |
| E2E | Playwright + `@axe-core/playwright` |
| Component docs | Storybook (latest) with `@storybook/nextjs-vite`, addon-a11y and addon-docs |
| Database tests | pgTAP via `supabase test db` |
| Performance | Lighthouse CI (`@lhci/cli`) |
| Git hooks and commits | husky + lint-staged + commitlint (`@commitlint/config-conventional`) |
| Releases | release-please (GitHub Action) |
| Dependency updates | Dependabot |

### Hosting
- Vercel, with the functions region set to `gru1` (São Paulo).
- Supabase in `sa-east-1`. See [ADR-0006](0006-environments-and-demo.md).

### Version policy
- At M0, each package is installed at its **latest stable** version, confirmed with Context7 and `npm view`.
- Versions are **pinned exactly** (no `^`) for the framework and security-relevant packages: Next, React, Supabase libraries, Zod, Serwist and Sentry. This follows the Supabase supply-chain guidance.
- `pnpm-lock.yaml` is committed. CI installs with `--frozen-lockfile`.
- Dependabot opens grouped weekly PRs, and they merge only with green CI.
- Before using any API from Next.js, Supabase, Tailwind, Motion or TanStack, check Context7. The training data may be outdated.

## Consequences

### Positive
- RSC and Server Actions keep most code on the server: secrets stay server-side, client bundles stay smaller and Lighthouse benefits.
- The RLS-first data access through `supabase-js` means authorization is enforced by the database for every query, including ones written later by mistake.
- Pinned versions plus Dependabot keep builds reproducible without letting them rot.

### Negative and trade-offs
- `proxy.ts` runs only on the Node runtime, so there is no edge runtime for tenant resolution. Latency is acceptable with Vercel functions in `gru1`.
- Hand-written migrations take more effort than declarative diffs. pgTAP and advisors compensate.
- Restyling shadcn/Radix to pixel fidelity costs more than adopting their default look.
- pnpm is not installed on the owner's machine yet. M0 installs it with `npm i -g pnpm`.

### Follow-ups
- M0: confirm exact versions, generate the lockfile, and record the chosen versions in CLAUDE.md.
- M8: confirm the Serwist integration mode and the Web Push library.

## Alternatives considered
- **Vite SPA or React Router 7.** Rejected: no RSC, weaker SEO for the landing page and `/verificar`, and more client-side auth surface.
- **Prisma or Drizzle connecting as `postgres`.** Rejected: that connection bypasses RLS, so isolation would depend on application code. We access data through `supabase-js` as the user, and through narrowly scoped `security definer` RPCs where elevated rights are required.
- **npm or Yarn.** npm works, but it is slower and less strict about phantom dependencies. Yarn PnP has friction with Next and Storybook.
- **Declarative Supabase schemas.** See the migrations decision above.
- **Jest.** Slower and needs more configuration than Vitest for ESM and TypeScript.

## Verification
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm storybook:build` and `pnpm e2e` all pass in CI from M0.
- CI checks for drift between the generated types and the local schema from M1.
- Dependabot PRs pass the full pipeline before merging.
