# ADR-0003: Authentication and identity

- Status: Accepted (2026-10-06)
- Date: 2026-10-06
- Deciders: owner, engineer
- Product confirmation: student provisional passwords confirmed by the owner on 2026-10-06
- Related: spec §2.1(3), §2.1(4), §4.3, §4.3(7), §4.3(8); design screens "Login", "Primeiro acesso", "Convites", "Painel da plataforma"; [ADR-0002](0002-multi-tenancy.md); [ADR-0004](0004-append-only-audit-log.md)

## Context

Five kinds of people sign in:

- secretaria staff;
- teachers;
- guardians;
- students;
- platform super-admins.

**Students.** Many have no personal email. The spec requires them to log in with **school code + matrícula + password**, with the secretaria able to reset the password under audit. The owner confirmed that students receive a **provisional password** from the secretaria and must change it at first login.

**Everyone else** is invited by email.

- The invitation lasts 7 days.
- The invitee lands on a "Primeiro acesso" page with an LGPD consent, a password strength meter and the rules ✓ 8+ characters, uppercase, number.

**Other requirements:**

- Password recovery by email, with the hint "ou procure a secretaria".
- Rate limiting on login and on invitations.
- Account lockout. The prototype's audit log shows "Conta bloqueada após 5 tentativas".

## Decision

### 1. Identity provider

- **Supabase Auth with email and password.**
- One `auth.users` row per human, across all tenants. Authorization comes from `memberships` ([ADR-0002](0002-multi-tenancy.md)), never from the identity record itself.

### 2. Student identity (synthetic, non-routable email)

- Supabase Auth requires an email or a phone, so a student account uses:

  ```
  {registration_code}@{tenant_id}.students.pauta.internal      (lower-cased)
  ```

- **Why the tenant UUID and not the tenant code:** the code can change ([ADR-0002](0002-multi-tenancy.md) §8), the UUID cannot.
- **Why `.internal`:** ICANN reserved it in 2024 for private use, so it can never be delivered to.
- Accounts are created server-side with the admin API, with `email_confirm: true`.
- These accounts **never send or receive email**:
  - the Send Email hook drops the `*.pauta.internal` domain (§8);
  - password recovery is refused for them.
- `registration_code` is immutable in normal operation. A rare correction updates the auth email through the admin API, and the change is audited.

### 3. Login flow (`/entrar` on the apex domain, prototype layout)

1. **School code** (mono field with the `.pauta.app` suffix). `public.resolve_tenant` checks it and the page shows "✓ {Escola} — {rede}".
2. **Identifier and password.** The identifier is an email, or a matrícula when it contains no `@`. A Server Action then:
   1. validates the input with Zod;
   2. checks the rate limits (§7);
   3. builds the synthetic email when the identifier is a matrícula;
   4. calls `signInWithPassword`;
   5. verifies an **active membership** in that tenant (or platform-admin status), and otherwise signs out with a neutral message;
   6. records the access event (success, failure or lock) with `audit.log_access_event` (service role only);
   7. redirects to the tenant host and the user's role home.
3. **Several roles in the tenant:** a role chooser appears after login.

The prototype's "Entrar como" role cards appear **only in the demo deployment** ([ADR-0006](0006-environments-and-demo.md)).

### 4. Provisional passwords (students)

- **Generation:**
  - Server-side, with a CSPRNG.
  - 10 characters from an unambiguous alphabet: no `0 O 1 l I`.
- **Delivery:**
  - The password is shown **once** on a printable "Ficha de acesso": school, code, matrícula, provisional password, instructions.
  - Only Supabase's hash persists.
- **Forced change:**
  - The server sets `app_metadata.must_change_password = true`; `app_metadata` is not user-editable.
  - `proxy.ts` reads it from the verified claims and confines the session to `/trocar-senha` until the user changes the password.
  - The flag is then cleared and the session refreshed.
- **Reset by the secretaria** (from the student record):
  - generates a new provisional password;
  - signs out the student's sessions through the admin API;
  - sets the flag again;
  - is audited with the actor and the target.

### 5. Password policy

- At least 8 characters, an uppercase letter and a number.
- Enforced:
  - in Zod (shared schema);
  - in Supabase Auth's password requirements configuration;
  - in the UI, by the 3-segment strength meter: "Senha fraca / Quase lá / Senha forte".

### 6. Password recovery

- **Email users:** `resetPasswordForEmail` with `redirectTo` set to the apex `/redefinir-senha` (PKCE / `token_hash` verification).
  - The response is always generic ("Se o e-mail estiver cadastrado, você receberá um link…"), so it does not reveal whether an account exists.
  - The endpoint is rate-limited.
- **Students:** the page explains "Alunos sem e-mail: procure a secretaria para redefinir a senha". The server rejects synthetic domains.

### 7. Rate limiting and lockout

- **Limiter:** `private.rate_limit_hit(key text, max int, window interval) returns boolean`, backed by Postgres and called from server code with the service role.
- **Login:**
  - At most 10 attempts per 15 minutes for each IP + identifier.
  - **5 consecutive failures for an identifier lock it for 15 minutes**, audited as "Conta bloqueada após 5 tentativas".
  - The UI shows a neutral message with a retry time.
- **Invitations:** limits per tenant and per actor on create and resend.
- **Supabase's own auth limits stay on.** Risk: server-side calls appear to come from Vercel's IP. At M2 we verify how to forward the client IP. If it cannot be forwarded, email users sign in from the browser client, after a server-side pre-check of the limiter and lockout.

### 8. Auth emails

- Supabase's **Send Email hook** calls `POST /api/auth/email-hook`. The handler:
  1. verifies the hook signature (Standard Webhooks secret);
  2. renders **React Email** templates in pt-BR;
  3. sends them through **Resend**;
  4. drops synthetic domains.
- **Development and E2E** use Mailpit (bundled with the Supabase CLI) via `EMAIL_TRANSPORT=smtp`.
- **Fallback:** if the hook is unavailable on our plan at M2, Supabase custom SMTP (Resend SMTP) with templates generated from React Email at build time.

### 9. Invitations (staff and guardians)

- **Storage:** our own `public.invitations` table, not `inviteUserByEmail`, so we control the copy, the expiry, resends and the audit trail.
- **Fields:**
  - tenant, email (citext), full name, role, target person (`teacher_id` / `guardian_id`);
  - `token_hash` (SHA-256 of 32 random bytes; the raw token exists only in the link);
  - status `pending | accepted | expired | revoked`;
  - `expires_at = now() + 7 days`, resend count, inviter.
- **Link:** `https://{code}.<root>/convite/{token}`. It is tenant-scoped, so a tenant-code change invalidates it, which matches the design's confirm copy.
- **Resend** rotates the token and extends the expiry.
- **Expiry:** a `pg_cron` job marks expired invitations hourly.
- **Primeiro acesso (`/convite/[token]`):**
  - Shows the data for the invitee to check: name, relationship, email, **masked CPF**, and "Algum dado errado? Fale com a secretaria".
  - Collects a phone number, a password and its confirmation, and the LGPD consent checkbox for the current policy version.
  - A route handler using the service role:
    1. validates the token;
    2. creates the auth user, **or**, if the email already has an account (for example a teacher at a second school), asks the person to sign in and then links the new membership;
    3. activates the membership and links `user_id` on the person record;
    4. inserts `consents (user_id, document, version, accepted_at)`;
    5. marks the invitation accepted;
    6. audits the acceptance.
  - Success shows the animated check, "Conta ativada" and "Entrar no portal".

### 10. Platform administrators

- Listed in `platform_admins`. **TOTP MFA is mandatory**: enrollment happens at first access.
- `app.is_platform_admin()` returns true only when the JWT `aal` claim is `aal2`.
- `/plataforma` lives on the apex domain and requires the same.

### 11. Sessions

- Cookie-based SSR sessions via `@supabase/ssr` ([ADR-0002](0002-multi-tenancy.md) §6).
- **Verification:**
  - Server code verifies identity with `auth.getClaims()`, a verified JWT (asymmetric signing keys).
  - It never trusts `getSession()` for authorization.
- **Revocation:**
  - Access is enforced by RLS on every request, so **revoking a membership cuts data access immediately**, even while a JWT is still valid. This covers a cancelled enrollment, where guardians lose access "no mesmo dia".
  - A password reset or provisional-password reset signs out all of the user's sessions.
  - A tenant code change forces re-login through `tenants.sessions_valid_after`.

### 12. Consents (LGPD)

- `consents` stores the document key, version and timestamp.
- When the privacy-policy version changes, a gate asks users to accept again before they continue.
- Each user can see their consent history in "Minha conta" (M6).

### 13. Key handling

- The browser only ever receives the **publishable** key.
- The **secret** (service-role) key is used only in modules marked `import 'server-only'`, through `src/lib/supabase/admin.ts`.
- An ESLint `no-restricted-imports` rule forbids importing it from client components.

## Consequences

### Positive

- Students without email get a simple, school-branded login. No email infrastructure touches minors' synthetic accounts.
- Every sensitive action leaves an audit trail: invitation, acceptance, reset, lock and login.
- Owning the invitation flow gives exact control over copy, expiry and resends, and keeps the prototype's states (Aceito / Pendente / Expirado) truthful.

### Negative and trade-offs

- The synthetic emails are an implementation detail that must stay invisible in the UI and in exports. A formatter maps them back to "Matrícula 2026-00418".
- The secretaria carries an operational burden: printing access slips and resetting passwords. This is expected in schools.
- Our own lockout adds a table and a code path to test, but it is required by the design.

### Follow-ups

- M2: verify, with Context7 and the Supabase docs, Send Email hook availability on our plan, the password requirement settings, and client-IP forwarding for auth rate limits.
- M4: the "Redefinir senha do aluno" action and the access slip in the student record.
- M6: password change and consent history in "Minha conta".

## Alternatives considered

- **Phone or SMS login for students.** Per-message cost; many students lack phones; it creates another PII field. Rejected.
- **Custom username/password auth for students outside Supabase Auth.** It loses battle-tested hashing, sessions and JWTs, and splits identity. Rejected.
- **Supabase `inviteUserByEmail` / magic links.** Less control over copy, expiry and audit. Magic links are also awkward on shared family devices. Rejected for invitations; magic-link login for guardians may come later (ROADMAP).
- **The guardian sets the student's password** (offered to the owner). The owner chose provisional passwords from the secretaria.
- **A tenant code in the synthetic email.** The code is mutable. Rejected.

## Verification

- **pgTAP:**
  - `app.is_platform_admin()` is false at `aal1`;
  - `audit.log_access_event` cannot be executed by `authenticated` or `anon`;
  - invitation token lookup only matches the hash;
  - expired invitations cannot be accepted.
- **Vitest:** password rules, strength scoring, identifier parsing (email vs matrícula), synthetic email building, and the provisional password alphabet and length.
- **E2E (M2):**
  - create school → invite secretaria → first access → login;
  - student login with a provisional password, then the forced change;
  - lockout after 5 failures;
  - the forgot-password email arrives in Mailpit and the reset works;
  - an expired invitation shows the right state.
