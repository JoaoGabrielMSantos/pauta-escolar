# CLAUDE.md — Pauta Escolar

@AGENTS.md

Multi-tenant school-management SaaS (Ensino Fundamental II e Médio, Brazil). Source of truth:

- [`docs/PLAN.md`](docs/PLAN.md): the milestones;
- [`docs/adr/`](docs/adr/README.md): the decisions;
- [`docs/design/README.md`](docs/design/README.md) and the prototype `docs/design/Secretaria Premium v2.dc.html`: design and exact business rules, in the `data-dc-script` block, `renderVals()`.

## Working agreement

- **One milestone at a time.** At the end of each:
  - tests green;
  - a PR is opened;
  - a summary with screenshots and the pending items;
  - this file is updated;
  - then **stop and wait for the owner's review**.
- **Decisions:**
  - Ambiguous **product** decision → ask the owner.
  - Technical decision with an obvious default → decide, record it in an ADR, move on.
- Plan before code on anything non-trivial.

### Tools

| When                                                                 | Tool                                                                                                              |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Before using any Next.js, Supabase, Tailwind, Motion or TanStack API | **Context7**, plus the version-exact Next docs in `node_modules/next/dist/docs/`                                  |
| End of every milestone that touches the DB                           | **Supabase MCP** `get_advisors` (security + performance) → zero findings. Locally/CI: `pnpm supabase db advisors` |
| Before any screen is done                                            | **Playwright MCP**: compare it with the prototype side by side at 390 / 768 / 1280 px                             |

### Skills

- `supabase` and `supabase-postgres-best-practices`: RLS and security.
- `frontend-design`: **only** for screens that do not exist in the prototype, always using the v2 tokens.
- The skills live in `.claude/skills/`, mirrored from `.agents/skills/`.

## Commands

| Task                               | Command                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| Install                            | `pnpm install`                                                                 |
| Dev server                         | `pnpm dev` → http://localhost:3000 (`/dev/design-system` exists only in dev)   |
| Production build / start           | `pnpm build` / `pnpm start`                                                    |
| Lint (zero warnings) / fix         | `pnpm lint` / `pnpm lint:fix`                                                  |
| Format / check                     | `pnpm format` / `pnpm format:check`                                            |
| Typecheck                          | `pnpm typecheck` (`next typegen` + `tsc --noEmit`)                             |
| Unit tests / coverage              | `pnpm test` / `pnpm test:coverage` (`src/domain` gate: 100%)                   |
| E2E + axe (needs `pnpm build`)     | `pnpm e2e` (projects: mobile 390, tablet 768, desktop 1280)                    |
| Storybook                          | `pnpm storybook` → http://localhost:6006 · `pnpm storybook:build`              |
| Lighthouse CI (needs `pnpm build`) | `pnpm lhci`                                                                    |
| Local Supabase (Docker)            | `pnpm db:start` / `pnpm db:stop` / `pnpm db:status`; CLI via `pnpm supabase …` |
| Everything quick                   | `pnpm check` (lint + typecheck + unit)                                         |

## Conventions

- **Language:** code, identifiers, DB objects, commits and technical docs are in **English**. Everything the user sees (UI copy, emails, PDFs, URL slugs) is in **pt-BR**, copied exactly from the prototype.
- **Layout:** `src/app` (routes) · `src/components/ui` (design system) · `src/components/<feature>` · `src/domain` (pure rules: no React, no Supabase; 100% covered) · `src/schemas` (Zod, shared) · `src/lib` · `src/hooks`.
- **Routes:**
  - Tenant pages live under `src/app/t/[tenant]/` (rewritten from `{code}.<root>`).
  - Each role is a URL segment: `secretaria/ professor/ aluno/ familia/` ([ADR-0002](docs/adr/0002-multi-tenancy.md)).
- **TypeScript:**
  - strict + `noUncheckedIndexedAccess`;
  - no `any` and no `!`; use a documented `as T` when an index is proven to be in range;
  - type-only imports use `import type`.
- **Styling:**
  - Use only token-backed Tailwind utilities: `text-ink`, `bg-surface`, `border-line`, `rounded-card`, `shadow-card`, `font-display`/`font-sans`/`font-mono`, `text-body`/`text-label`/…
  - The default Tailwind palette, radii, shadows and breakpoints are **disabled**.
  - Breakpoints: `tablet:` (≥ 720px) and `desktop:` (≥ 1080px), mobile-first.
  - Tokens live in `src/styles/tokens.css` and the `@theme` block of `src/app/globals.css`. Never hardcode a hex value in a component.
- **States and a11y:**
  - Every data screen has loading (skeleton + `aria-busy`), empty, error ("Tentar de novo") and success (toast) states.
  - Situations are always shown as icon + text.
  - Touch targets are 44px; the focus ring follows the README.
- **Numbers and dates:**
  - Parse and format pt-BR through `src/domain` ("5,5").
  - Dates use the `America/Sao_Paulo` timezone, with `date-fns` + `ptBR`.
  - Nothing is hardcoded: no "3º tri", no "9º B", no "2026".
- **Git:**
  - Conventional Commits, small and atomic.
  - Branches: `feat/m1-…`, `fix/…`, `chore/…`.
  - PRs are squash-merged and **the PR title is the commit on main**, so it must be conventional.
  - Never push to `main`. A ruleset enforces this.
- **Dependencies:**
  - Exact pins and a committed lockfile.
  - **7-day quarantine:** pnpm `minimumReleaseAge` and the Dependabot cooldown.
  - If install fails with `ERR_PNPM_NO_MATURE_MATCHING_VERSION`, pick an older version instead of adding exclusions.
- **Migrations:**
  - Create them with `pnpm supabase migration new <name>`.
  - They are **immutable after merge**: fixes go in a new migration.
  - Hand-written imperative SQL.

## Glossary (pt-BR → code)

| pt-BR                                        | code                                                              |
| -------------------------------------------- | ----------------------------------------------------------------- |
| escola / instituição                         | `tenant`                                                          |
| código da escola                             | `tenants.code`                                                    |
| secretaria (papel)                           | role `secretary`                                                  |
| professor                                    | `teacher`                                                         |
| aluno                                        | `student`                                                         |
| número de matrícula                          | `students.registration_code`                                      |
| responsável                                  | `guardian`                                                        |
| dependente                                   | `student` linked through `student_guardians`                      |
| vínculo (papel numa escola)                  | `membership`                                                      |
| super-admin da plataforma                    | `platform_admin`                                                  |
| turma                                        | `class`                                                           |
| disciplina                                   | `subject`                                                         |
| disciplina ofertada numa turma               | `class_subject`                                                   |
| matrícula (vínculo aluno–turma)              | `enrollment`                                                      |
| remanejamento                                | enrollment status `reassigned`                                    |
| transferência                                | enrollment status `transferred`                                   |
| cancelamento                                 | enrollment status `cancelled`                                     |
| ano letivo                                   | `academic_year`                                                   |
| período letivo (bimestre/trimestre/semestre) | `term` (`term_type`: bimester/trimester/semester)                 |
| composição da nota (categorias)              | `assessment_category` (in an `assessment_composition`)            |
| nota                                         | `grade` (normalized `score`)                                      |
| lançamento de notas                          | grade entry / grading sheet                                       |
| fechamento do lançamento                     | `grade_lock`                                                      |
| reabrir lançamento                           | grade lock reopen                                                 |
| retificação                                  | `grade_correction_request`                                        |
| recuperação                                  | `recovery_grade`                                                  |
| média mínima / frequência mínima             | `min_grade` / `min_attendance`                                    |
| boletim                                      | report card                                                       |
| ficha do aluno                               | student record page                                               |
| chamada                                      | `attendance` (`attendance_sessions`, `attendance_records`: P/F/J) |
| justificativa de falta                       | `absence_justification`                                           |
| ocorrência                                   | `incident`                                                        |
| medida disciplinar                           | `incident.measure`                                                |
| ciência / assinatura do responsável          | `incident_acknowledgement`                                        |
| comunicado                                   | `announcement`                                                    |
| mural da turma (aviso/atividade/material)    | `class_post` (`notice` / `activity` / `material`)                 |
| entrega                                      | `post_completion`                                                 |
| convite                                      | `invitation`                                                      |
| primeiro acesso                              | first access (invitation acceptance)                              |
| radar pedagógico                             | risk radar (`risk_snapshots`)                                     |
| log de auditoria                             | `audit.audit_log`                                                 |
| documento verificável                        | `issued_document`                                                 |

## Non-negotiable security rules

1. **Tenant isolation:**
   - Every domain table has `tenant_id uuid not null` (FK + index) and composite FKs `(tenant_id, parent_id)`.
   - RLS is **enabled on every table** in exposed schemas.
2. **Authorization helpers:**
   - They live in schema `app` as `security definer stable set search_path = ''`, with `EXECUTE` revoked from `public`/`anon`.
   - Policies use the set-returning helpers inside `(select …)`, **one permissive policy per (table, command)**, always `to authenticated`.
   - `UPDATE` policies have both `USING` and `WITH CHECK`.
3. **Roles:**
   - Roles live in `memberships`; super-admins in `platform_admins` (MFA, `aal2`).
   - Tenant, role and permissions from the client are **never** trusted. Neither is `user_metadata`.
4. **Critical rules are enforced in the database, not only in the UI:**
   - A locked grade rejects writes (trigger).
   - Corrections and reopenings go through audited `security definer` functions.
   - A teacher sees only their own classes; a guardian only linked dependents; a student only themself.
5. **Audit log:**
   - Append-only: no UPDATE/DELETE/TRUNCATE for anyone, service role included.
   - Written by triggers, hash-chained per tenant ([ADR-0004](docs/adr/0004-append-only-audit-log.md)).
6. **Service role key:**
   - It **never reaches the client**.
   - Privileged operations run in Route Handlers / Server Actions / Edge Functions, with Zod validation and an explicit role check.
7. **Storage:**
   - Private buckets, with paths `tenant_id/...` and policies on `storage.objects`.
   - Short-lived signed URLs; a 20 MB limit and a MIME allowlist.
8. **LGPD:**
   - Collect the minimum. CPF is masked in the UI.
   - Consents are stored with version and date.
   - Data can be exported or anonymized per subject.
   - No PII in Sentry or in logs.
9. **Hardening:**
   - Rate limiting on login, invitations and `/verificar`.
   - Security headers. The nonce-based CSP lands in M2 with `proxy.ts`.
10. **pgTAP:**
    - Isolation and role tests for every table.
    - CI fails if any of them fails.

## Design notes

- **Animation timings** (README → "Animações"):
  - module change 200ms;
  - stagger 220ms, entry only;
  - KPI count-up 750ms;
  - modals open in 220ms and close in 140ms;
  - with reduced motion, only opacity.
  - Tokens live in `tokens.css` / `globals.css`.
- **Icons:** replace the prototype's Unicode glyphs with **Lucide**, keeping their meaning. Proposed mapping, finalized in M3:
  - Navigation:

    | Glyph | Meaning              | Lucide            |
    | ----- | -------------------- | ----------------- |
    | ◱     | painel               | `LayoutDashboard` |
    | ▤     | turmas               | `LayoutList`      |
    | ✎     | professores          | `UserPen`         |
    | ◍     | alunos               | `GraduationCap`   |
    | +     | nova matrícula       | `UserPlus`        |
    | ▦     | boletim              | `FileChartColumn` |
    | ◷     | chamada / frequência | `CalendarCheck`   |
    | !     | ocorrências          | `TriangleAlert`   |
    | ◉     | comunicados          | `Megaphone`       |
    | ≡     | auditoria            | `ScrollText`      |
    | ⚙     | configurações        | `Settings`        |
    | ◑     | composição           | `ChartPie`        |
    | ↻     | recuperação          | `RotateCcw`       |
    | ▤     | matérias             | `BookOpen`        |
    | —     | calendário (new)     | `Calendar`        |
    | —     | radar (new)          | `Radar`           |

  - States and actions:

    | Glyph | Meaning         | Lucide       |
    | ----- | --------------- | ------------ |
    | ✓     | ok              | `Check`      |
    | ■     | fechado         | `Lock`       |
    | ◷     | pedido pendente | `Clock`      |
    | ▤     | anexo           | `Paperclip`  |
    | ⋯     | more            | `Ellipsis`   |
    | ▲     | tendência       | `TrendingUp` |
    | ↓     | queda           | `ArrowDown`  |

- **The prototype is a reference, not code to copy.** Its data is mock: never ship "412 famílias", "3º tri", "9º B"…
- **Next 16 Cache Components** are enabled (`cacheComponents: true`):
  - dynamic data must sit under `<Suspense>`, or in `use cache` where it is safe to cache;
  - client navigation keeps previous routes mounted in `<Activity mode="hidden">`, so state persists. Account for this in the M3 `<main>` enter animation.

## Gotchas

- TypeScript is pinned to **6.0.x**: typescript-eslint supports `<6.1`. ESLint is pinned to **9.x**: eslint-plugin-jsx-a11y does not support 10. Dependabot ignores those majors.
- Tailwind runs through **PostCSS** (`@tailwindcss/postcss`), so Next/Turbopack and Storybook/Vite share one pipeline.
- Vite 8 resolves the tsconfig paths natively (`resolve.tsconfigPaths`); no plugin is needed.
- Lighthouse CI asserts performance ≥ **0.90** until M9, where the gate is raised to 0.95. Accessibility, best practices and SEO are asserted at ≥ 0.95 already.
  - The provisional page scores 0.96–0.98 locally.
  - The simulated LCP is dominated by the base Next/React runtime: about 2.4 s simulated vs 0.2 s observed.
- shadcn is initialized (`components.json`, `cn`, Radix) but no component has been added yet. Components are added and restyled with the tokens in M3, via `pnpm dlx shadcn@<pinned> add …`.
- Windows: run commands with `pnpm`. Docker Desktop must be running for `pnpm db:start`. Visual-regression baselines are generated only in the Playwright Linux container (M3).

## Milestone status

| Milestone                  | Status                                  | Notes                                                                                                                            |
| -------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| M0 — Foundation            | **In progress** (`chore/m0-foundation`) | Next 16, TS strict, Tailwind v4 tokens, ESLint/Prettier, Vitest, Playwright+axe, Storybook, husky/commitlint, CI, release-please |
| M1 — Database & security   | Planned                                 |                                                                                                                                  |
| M2 — Auth & tenancy        | Planned                                 |                                                                                                                                  |
| M3 — Shell & design system | Planned                                 |                                                                                                                                  |
| M4 — Secretaria acadêmica  | Planned                                 |                                                                                                                                  |
| M5 — Professor             | Planned                                 |                                                                                                                                  |
| M6 — Aluno & família       | Planned                                 |                                                                                                                                  |
| M7 — Governança            | Planned                                 |                                                                                                                                  |
| M8 — Assinatura            | Planned                                 |                                                                                                                                  |
| M9 — Lançamento            | Planned                                 |                                                                                                                                  |
