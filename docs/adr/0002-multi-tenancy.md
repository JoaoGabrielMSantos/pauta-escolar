# ADR-0002: Multi-tenancy: isolation, tenant resolution and RLS pattern

- Status: Accepted (2026-10-06)
- Date: 2026-10-06
- Deciders: owner, engineer
- Related: spec §2.1(6), §4.1, §4.3; [ADR-0003](0003-authentication-and-identity.md); [ADR-0006](0006-environments-and-demo.md)

## Context

Every school is a tenant. Data from one school must never reach another, whether through a bug in application code, a crafted request or a missing filter.

Users also cross tenants legitimately:
- a teacher may work at two schools;
- a guardian may have children in different schools.

Each school is addressed as `{code}.pauta.app`, and the secretaria can change its code (design screen "Configurações → Código do tenant"). Spec §4.3 makes RLS on every table, private `security definer` helpers and never trusting client-supplied tenant or role non-negotiable.

## Decision

### 1. Isolation model: shared database, shared schema, `tenant_id` column
- Every tenant-scoped table has `tenant_id uuid not null references public.tenants(id)`.
- Every such table also has `unique (tenant_id, id)`, and its indexes lead with `tenant_id` where useful.
- **Child tables use composite foreign keys.** For example:

  ```sql
  foreign key (tenant_id, student_id) references public.students (tenant_id, id)
  ```

  A row in tenant A therefore cannot reference a parent in tenant B, even if RLS were misconfigured.
- Platform-level tables have no `tenant_id`: `tenants`, `platform_admins`, `profiles`.

### 2. Authorization data
- `public.memberships (user_id, tenant_id, role, status)`:
  - role is one of `secretary`, `teacher`, `student`, `guardian`;
  - status is one of `invited`, `active`, `suspended`, `revoked`;
  - one row per user, tenant and role.
- Platform super-admins are listed in `public.platform_admins (user_id)`.
- Domain people records (`teachers`, `students`, `guardians`) are tenant-scoped and carry a nullable `user_id`, filled when an invitation is accepted. A guardian with children in two schools has one `guardians` row per tenant, both pointing to the same auth user.
- **Nothing about tenant or role is ever read from client input**, nor from `user_metadata`, which users can edit. Only `app_metadata` may carry server-set flags, and only flags that do not grant data access ([ADR-0003](0003-authentication-and-identity.md)).

### 3. RLS pattern

**RLS everywhere**
- RLS is enabled on **every** table in exposed schemas.
- Private schemas (`app`, `audit`, `private`) are not exposed to the Data API. RLS still applies there as defense in depth where tables exist.
- Explicit `GRANT`s per table and role. `anon` gets only:
  - `public.resolve_tenant(code)`, which returns id, name, network label and status, and nothing sensitive;
  - `public.verify_document(code)`.

**Helpers**
- They live in schema `app` and are declared `security definer`, `stable` and `set search_path = ''`.
- `EXECUTE` is revoked from `public` and `anon` and granted to `authenticated`.
- Each one reads `auth.uid()` internally.

**Set-returning helpers for policies.** These are row-independent, so wrapped in `(select …)` the planner evaluates them **once per statement** and does not re-run them for every row:

```sql
create function app.tenant_ids_with_role(p_roles app.role[])
returns setof uuid language sql stable security definer set search_path = '' as $$
  select m.tenant_id from public.memberships m
  where m.user_id = (select auth.uid()) and m.status = 'active' and m.role = any (p_roles)
$$;

-- example policy
create policy grades_select on public.grades for select to authenticated using (
  tenant_id in (select app.tenant_ids_with_role('{secretary}'))
  or class_subject_id in (select app.taught_class_subject_ids())
  or student_id in (select app.guardian_student_ids())
  or student_id in (select app.self_student_ids())
);
```

**Boolean helpers for RPC bodies:** `app.has_role(tenant, roles[])`, `app.is_guardian_of(student)`, `app.teaches(class_subject)` and `app.is_platform_admin()`. The last one requires `aal2`.

**Policy conventions**
- **One permissive policy per (table, command)**, combining the role branches with `or`. This avoids the `multiple_permissive_policies` advisor lint and keeps each policy readable in one place.
- `to authenticated` is always used. `auth.role()` is never used.
- `UPDATE` policies always have both `USING` and `WITH CHECK`, so rows cannot be moved to another tenant or student.
- Views are created `with (security_invoker = true)`.

### 4. Tenant resolution (`src/proxy.ts`)
- `TENANCY_MODE` selects one of three modes:
  - `subdomain` (production): `{code}.<ROOT_DOMAIN>/x` is rewritten internally to `/t/{code}/x`. The apex `<ROOT_DOMAIN>` serves the landing page, `/entrar`, `/esqueci-senha`, `/redefinir-senha`, `/verificar/*`, `/plataforma` and the legal pages.
  - `path` (development default and E2E): the URL is literally `/t/{code}/x` on `localhost:3000`. `{code}.localhost:3000` also works when the mode is set to `subdomain`; browsers resolve `*.localhost` to loopback.
  - `single` (demo deployment): every request maps to `DEFAULT_TENANT_CODE` ([ADR-0006](0006-environments-and-demo.md)).
- The code is looked up through `public.resolve_tenant`, cached and tagged by code. The cache is invalidated when a code changes.
- An unknown code returns 404 in the system style. A `suspended` tenant gets a blocked page.
- **Reserved codes** cannot be used as tenant codes: `www, app, admin, api, demo, plataforma, static, assets, mail, status, docs, blog`. The list lives in `src/domain/codes.ts` and is mirrored in a DB check constraint.
- All links are built with one helper, `tenantUrl(code, path)`, which knows the current mode.

### 5. URL structure
- Inside a tenant, URLs carry the role segment: `/secretaria/…`, `/professor/…`, `/aluno/…`, `/familia/…`.
- Each segment's layout checks that the user has an active membership with that role in the resolved tenant; otherwise it returns 403. RLS still enforces everything below it.
- Route groups would collide (`notas`, `frequencia` and `comunicados` exist for several roles) and would hide the authorization boundary.
- Slugs are pt-BR because they are user-facing UI. Code identifiers are English.

### 6. Sessions and cookies
- Supabase SSR cookies via `@supabase/ssr` (`getAll`/`setAll`). `proxy.ts` refreshes the session with `auth.getClaims()`.
- **Production:** the cookie domain is `.<ROOT_DOMAIN>`, so one login works across a user's schools. Cookies are `Secure` and `SameSite=Lax`.
- **Development:** host-only cookies.
- Server Actions `allowedOrigins` includes `*.<ROOT_DOMAIN>`. Route handlers that mutate check the `Origin` header.

### 7. Active context rules
- **Tenant:** taken from the resolved URL. **Role:** taken from the URL segment. Both are verified on the server in the layout, and RLS enforces them again.
- Inserts set `tenant_id` from the server-resolved context, never from the request body. Each policy's `WITH CHECK` requires the inserting user to hold the right membership in that tenant.
- **Multiple roles in one tenant** (for example a teacher who is also a guardian): the header shows a role switcher listing the user's memberships.
- **Multiple schools:**
  - The sidebar school switcher (present in the prototype as "E. M. Jardim Botânico ▾") lists the user's tenants.
  - Guardian dependent chips come from `public.my_dependents()`, which returns each dependent with its tenant code and school name, across tenants, and only for the caller's own dependents.
  - Picking a dependent from another school navigates to that school's host. The shared cookie means no new login.

### 8. Tenant code change
- Only the secretaria can change the code. It must type the current code to confirm (design screen 11).
- The new code must match `^[a-z0-9-]{3,20}$`, differ from the current one and not be reserved.
- In one transaction:
  - update `tenants.code`;
  - insert into `tenant_code_history`;
  - set `tenants.sessions_valid_after = now()`;
  - revoke pending invitation tokens.
- Everything is audited.
- Effects, matching the confirm-dialog copy:
  - The old code stops resolving immediately.
  - `proxy.ts` forces re-login for sessions whose JWT `iat` is before `sessions_valid_after`.
  - Pending invitations, whose links are on the tenant host, must be resent.
- Student synthetic identities use the tenant **UUID**, so they are unaffected ([ADR-0003](0003-authentication-and-identity.md)).

## Consequences

### Positive
- A single schema and migration path keeps operations simple. The Data API works as designed.
- Isolation is enforced three times:
  - composite FKs (structural);
  - RLS (every query);
  - the server context (UX and correctness).
- Multi-school users have one identity and one login.
- The policies follow the planner-friendly helper pattern recommended for RLS performance.

### Negative and trade-offs
- Every table needs `tenant_id` plus composite keys, which adds verbose DDL. Mitigation: a migration template and a pgTAP check that every FK into a tenant table is composite.
- A noisy neighbor can affect others on the shared database. That is acceptable at school scale; per-tenant query limits are on the ROADMAP.
- Wildcard subdomains on Vercel require the domain's nameservers on Vercel (M9).

### Follow-ups
- M1: helper functions, policies, composite FKs, and pgTAP isolation tests for every table × tenant × role × command.
- M2: `proxy.ts`, `tenantUrl`, the cache and its invalidation, the reserved-code list, and `sessions_valid_after`.

## Alternatives considered
- **Schema per tenant.** Migrations fan out to every schema, the Data API exposes a fixed set of schemas, and cross-tenant identity becomes awkward. Rejected.
- **Database or project per tenant.** Cost and operational burden are disproportionate for this product stage. Rejected.
- **Tenant from a cookie or header chosen by the client.** It is easy to forge, and spec §4.3 forbids it. Rejected.
- **Policies with row-dependent boolean helpers** (`app.has_role(tenant_id, …)` evaluated per row). Correct, but slower on large scans than the set-returning pattern. Used only inside RPCs.
- **Next.js route groups per role.** URL collisions and an implicit authorization boundary (see §5). Rejected.

## Verification
- **pgTAP (CI-blocking), for every tenant-scoped table:**
  - a user of tenant A cannot select, insert, update or delete tenant B rows;
  - each role reaches only what it should (teacher → own classes, guardian → linked dependents, student → self);
  - `anon` reaches nothing except the two public RPCs.
- pgTAP asserts that every FK into a tenant-scoped table is composite with `tenant_id`.
- The advisors report no `rls_disabled_in_public`, `auth_rls_initplan` or `multiple_permissive_policies` findings.
- E2E covers code resolution (path mode plus a subdomain smoke test), an unknown code (404), a suspended tenant, a cross-school dependent switch, and re-login after a code change.
