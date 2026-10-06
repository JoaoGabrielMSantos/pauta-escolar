# ADR-0006: Environments, configuration and the public demo

- Status: Accepted (2026-10-06)
- Date: 2026-10-06
- Deciders: owner, engineer
- Product confirmation: separate demo project confirmed by the owner on 2026-10-06
- Related: spec §3(7), §7, §8; [ADR-0002](0002-multi-tenancy.md); [ADR-0004](0004-append-only-audit-log.md)

## Context

The product needs four things from its environments:

- a fast local loop on Windows, with Docker available;
- a CI that tests the database for real;
- a production environment with Brazilian data residency;
- a **public demo**. It is the portfolio's business card, and anyone can enter it as Secretaria, Professor, Aluno or Responsável. It is reset daily and holds realistic data, including patterns that trigger the Radar.

A demo **inside** the production database would conflict with the append-only audit log: resetting it means deleting audit rows. It would also expose production to anonymous visitors' writes. The owner chose a **separate Supabase project** for the demo.

## Decision

### 1. Environments

| Env            | App                                                         | Database                                                                | Tenancy mode                                      | Data                                                                                                        |
| -------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **local**      | `pnpm dev` (Next.js)                                        | Supabase CLI stack on Docker (`pnpm supabase start`), Mailpit for email | `path` (default) or `subdomain` via `*.localhost` | `pnpm db:reset` = migrations + `scripts/seed.ts`: tenant `demo` (realistic) + tenant `escola-b` (isolation) |
| **ci**         | GitHub Actions, built app for E2E                           | Ephemeral Supabase CLI stack inside the runner                          | `path`                                            | Same seed as local                                                                                          |
| **preview**    | Vercel preview deployments per PR (optional, from M3)       | **Demo project** (fake data only; never production)                     | `path`                                            | Demo data                                                                                                   |
| **production** | Vercel project `pauta-escolar`, functions in `gru1`         | Supabase project `pauta-prod`, `sa-east-1`                              | `subdomain` on `<ROOT_DOMAIN>`                    | Real tenants only; no seed                                                                                  |
| **demo**       | Vercel project `pauta-escolar-demo` at `demo.<ROOT_DOMAIN>` | Supabase project `pauta-demo`, `sa-east-1`                              | `single` (`DEFAULT_TENANT_CODE=demo`)             | Seeded daily                                                                                                |

- Both hosted projects run on the Supabase Free tier until the owner decides otherwise. Every action with a cost is confirmed with the owner first.
- On the Free tier, `pauta-prod` may pause after inactivity. We reactivate it as needed until launch.

### 2. Configuration (env vars; `.env.example` is committed without secrets)

| Variable                                                           | Scope                | Notes                                                                   |
| ------------------------------------------------------------------ | -------------------- | ----------------------------------------------------------------------- |
| `NEXT_PUBLIC_ROOT_DOMAIN`                                          | public               | e.g. `pauta.app`; `localhost:3000` in dev                               |
| `TENANCY_MODE`                                                     | server               | `subdomain` \| `path` \| `single`                                       |
| `DEFAULT_TENANT_CODE`                                              | server               | only for `single`                                                       |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public               | publishable key only                                                    |
| `SUPABASE_SECRET_KEY`                                              | server-only          | never prefixed `NEXT_PUBLIC_`; imported only from `server-only` modules |
| `SEND_EMAIL_HOOK_SECRET`                                           | server-only          | Supabase auth hook signature                                            |
| `EMAIL_TRANSPORT`, `RESEND_API_KEY`, `EMAIL_FROM`                  | server-only          | `smtp` (Mailpit) in dev and CI, `resend` in prod, `disabled` in demo    |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`                | public / server-only | Web Push (M8)                                                           |
| `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`                      | public / CI          | M9                                                                      |
| `NEXT_PUBLIC_DEMO_MODE`                                            | public               | `true` only on the demo deployment                                      |
| `DEMO_PASSWORD`                                                    | server-only          | demo quick-login password; never sent to the client                     |

- `src/lib/env.ts` validates the environment with Zod at boot: server and client schemas are separate, and the app fails fast when a variable is missing.
- Real `.env.local` files are git-ignored.
- In GitHub Actions, the deploy and reset workflows use per-environment secrets. The `production` environment requires the owner's approval.

### 3. Database delivery

- Migrations are applied to production by a manually approved GitHub Actions workflow running `supabase db push` against `pauta-prod`. It is triggered on a release tag.
- Migrations are never edited after merge; fixes go in new migrations.
- `get_advisors` (security and performance) runs against `pauta-prod` through the MCP after each milestone that changes the database.
- Backups:
  - The Free tier has no point-in-time recovery.
  - Before production carries real schools, the owner decides on Pro (PITR, leaked-password protection).
  - This decision is tracked as an M9 risk.

### 4. Public demo

- **Deployment:** the same codebase as production, with `NEXT_PUBLIC_DEMO_MODE=true`, `TENANCY_MODE=single` and its own Supabase project. In production, `demo` is a reserved tenant code.
- **Entry:** the prototype's "Entrar como" cards (Secretaria / Professor / Aluno / Responsável) call a Server Action that signs in the pre-seeded demo user for that role. The credentials stay on the server. The sidebar keeps the "Sessão de demonstração" role switcher.
- **Seed (`scripts/seed.ts --target demo`):**
  - Volume: 5 classes, about 150 students and plausible pt-BR names.
  - Academic data: 3 terms of grades and attendance, generated **relative to the current date**, so the current term is always "in progress".
  - Staff and requests: teachers with invitations in mixed states, and pending justification and correction requests.
  - School life: incidents, and announcements with read percentages.
  - Risk patterns for the Radar: falling attendance, declining grades, several subjects below the minimum, recent incidents.
- **Daily reset (`.github/workflows/reset-demo.yml`)**, scheduled at 06:00 UTC (03:00 in Brasília) with a manual dispatch option:
  1. `supabase link --project-ref $DEMO_PROJECT_REF`.
  2. Reset the remote database: drop it and reapply all migrations. The exact CLI flags are verified at M8.
  3. Empty the demo storage buckets.
  4. Run `pnpm seed --target demo`, which creates auth users through the admin API plus all data.
  5. Smoke check: resolve the tenant and log in as each role.
  6. On failure, notify the owner through a GitHub issue.
- **Demo guards** (server-side, keyed on `NEXT_PUBLIC_DEMO_MODE`):
  - **Simulated actions:**
    - Outbound email is disabled. Invitation and justification toasts say "(simulado na demonstração)".
    - Web Push is limited to the visitor's own browser subscription.
    - Password changes and tenant code changes are simulated: the confirm dialog runs, nothing persists.
  - **Limits and notices:**
    - Uploads are capped at 2 MB, with the same MIME allowlist.
    - A persistent banner reads "Ambiente de demonstração — dados fictícios, reiniciados diariamente".
    - Rate limits are tighter than in production.
- **Isolation:** no secret, key or user is shared between `pauta-demo` and `pauta-prod`. A compromise of the demo cannot reach production data.

## Consequences

### Positive

- The production audit log stays append-only **without exceptions**.
- Anonymous demo traffic can never touch real schools.
- A reset is a full rebuild from migrations, so it also continuously proves that the migrations apply cleanly from scratch.
- Previews get realistic data without risk.

### Negative and trade-offs

- Two hosted projects and two Vercel projects mean more setup and two sets of secrets.
- The Free tier allows two active projects. Both slots are used (prod and demo), so a separate hosted staging needs Pro or a branch.
- Demo visitors share one tenant and may see each other's changes during the day. The daily reset bounds this.

### Follow-ups

- M0: `.env.example`, `src/lib/env.ts` skeleton, CI with local Supabase.
- M1: create `pauta-prod` after the owner confirms the cost.
- M8: create `pauta-demo`, the demo Vercel project, `reset-demo.yml` and the demo guards.
- M9: custom domains (apex, wildcard, `demo.`), the Resend sending domain and the PITR decision.

## Alternatives considered

- **A demo tenant in the production database** (the option offered to the owner). It needs an append-only exception for purging demo audit rows and mixes anonymous traffic with production. The owner did not choose it.
- **A per-visitor ephemeral demo tenant** (cloned on demand). Visitors would be isolated, but it adds cloning cost, cleanup jobs and storage growth. Possible later (ROADMAP).
- **Resetting the demo with a SQL truncate-and-reseed function.** The audit guard triggers block it, by design. A full reset is simpler and also validates the migrations.

## Verification

- `reset-demo.yml` runs green on schedule. Its smoke step logs in as all four roles.
- An E2E run against the demo URL in M8 checks:
  - the banner;
  - the quick login for each role;
  - simulated invitations: no email sent, and the toast copy;
  - the upload cap.
- `src/lib/env.ts` tests: a missing required variable fails at boot, and server-only variables never appear in the client bundle (build-time check).
