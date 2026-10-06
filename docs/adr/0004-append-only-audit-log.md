# ADR-0004: Append-only, hash-chained audit log

- Status: Accepted (2026-10-06)
- Date: 2026-10-06
- Deciders: owner, engineer
- Related: spec §3(2), §4.3(4); design screen "Log de auditoria" and the README "Backend sugerido"; [ADR-0002](0002-multi-tenancy.md); [ADR-0003](0003-authentication-and-identity.md); [ADR-0006](0006-environments-and-demo.md)

## Context

"Diário imutável e auditável" is one of the product's signature promises. The spec sets five requirements:

1. Every grade, enrollment and configuration change, and every login, is recorded.
2. Records are written by **database triggers, not the frontend**.
3. The log is **append-only for everyone**, including the service role used by the application.
4. Each record carries the **hash of the previous one**, and the super-admin can verify integrity.
5. Each grade shows a **timeline**: lançada → fechada → retificada.

The design's audit screen filters by user, by action type (Nota alterada, Matrícula, Acesso, Configuração) and by period. Each row shows when, who (with role), type, what, target and "anterior → novo".

## Decision

### 1. Storage
- `audit.audit_log` lives in the `audit` schema, which is **not exposed** to the Data API.
- Columns:

  ```
  id            bigint generated always as identity primary key
  tenant_id     uuid null              -- null = platform-level event (tenant creation, admin actions)
  seq           bigint not null        -- 1, 2, 3… per tenant chain
  occurred_at   timestamptz not null default clock_timestamp()
  actor_user_id uuid null              -- null = system (cron, triggers without a user)
  actor_role    text not null          -- secretary | teacher | student | guardian | platform_admin | system
  actor_label   text not null          -- display snapshot ("Cristina Alves")
  category      audit.category not null  -- grade | enrollment | access | settings | attendance | incident |
                                         -- communication | document | request | platform
  action        text not null          -- e.g. 'grade.updated', 'grade_lock.reopened', 'enrollment.transferred'
  entity_table  text not null
  entity_id     uuid null
  target_label  text null              -- display snapshot ("Danilo Ferraz Uchôa")
  before        jsonb null             -- only changed columns, PII-minimized
  after         jsonb null
  context       jsonb not null default '{}'  -- request id, reason, correction id… (no raw IPs)
  prev_hash     bytea not null
  hash          bytea not null
  unique (tenant_id, seq)
  ```

- The four UI chips map onto categories:
  - **Nota alterada** = grade, plus recovery, lock and correction actions;
  - **Matrícula** = enrollment;
  - **Acesso** = access;
  - **Configuração** = settings.
- The other categories appear under "Todos". Whether to add more chips is decided in M7, using the v2 tokens.

### 2. Write path: triggers only
- `audit.capture()` is a generic `AFTER INSERT OR UPDATE OR DELETE … FOR EACH ROW` trigger function, attached to every audited table.
- Per-table configuration lives in `audit.tracked_tables`: category, action names, ignored columns (`updated_at`, …) and redacted columns (CPF, phone, address).
- The function is `security definer`, owned by a dedicated `audit_writer` role (`nologin`), the only role allowed to `INSERT` into `audit.audit_log`.
- The actor comes from `auth.uid()` and the `request.jwt.claims` setting, plus a display label resolved from `profiles`. Inside `cron` or system functions the actor is `system`.
- Before and after hold only the changed columns. Redacted columns are reported as `"[alterado]"`, never with their values.
- **Access events** (login success or failure, lockout, password change or reset, invitation accepted, incident acknowledgement or signature) cannot be captured by triggers on the `auth` schema. Supabase discourages triggers there.
  - They go through `audit.log_access_event(...)`, executable **only by `service_role`** and called from server code after the event.
  - The insert, chaining and immutability rules are identical.

### 3. Immutability
- The table is owned by `audit_owner` (`nologin`, no member roles).
- Privileges:

  ```sql
  revoke all on audit.audit_log from public, anon, authenticated, service_role;
  grant insert on audit.audit_log to audit_writer;
  ```

- Guard triggers:
  - `BEFORE UPDATE OR DELETE … FOR EACH ROW` and `BEFORE TRUNCATE … FOR EACH STATEMENT` call `audit.forbid_mutation()`, which raises `audit_log is append-only`.
  - These guards also stop roles that might be granted privileges by mistake later.
- Reads go only through RPCs (§5). No role has `SELECT` on the table directly.

### 4. Hash chain (per tenant)
- A `BEFORE INSERT` trigger on `audit.audit_log`:
  1. takes `pg_advisory_xact_lock(hashtextextended('audit:' || coalesce(tenant_id::text, 'platform'), 0))`;
  2. reads the tenant's last `(seq, hash)` through the unique index;
  3. sets:

     ```
     seq       = last.seq + 1                                  -- or 1
     prev_hash = last.hash                                     -- or 32 zero bytes (genesis)
     hash      = sha256(prev_hash || convert_to(canonical_payload::text, 'UTF8'))
     ```

  - `canonical_payload` is a `jsonb_build_object` of every content column. `jsonb` text output is deterministic: keys are sorted and whitespace is normalized.
  - `sha256` comes from `pgcrypto` (`extensions.digest`).
- **Per-tenant chains** rather than one global chain:
  - writes in one school never wait for another;
  - each school's log can be verified and exported independently.
- `audit.verify_chain(p_tenant uuid)` recomputes the chain in `seq` order. It returns `ok`, or the first `seq` whose `prev_hash` or `hash` does not match.
  - Its core is `audit.verify_rows(rows)`, which runs over any ordered set of chain rows. This makes tamper detection testable on a copy, without touching live rows.
  - It is exposed through `public.verify_audit_chain(p_tenant)` to platform admins at `aal2`.
  - It runs in batches so large tenants are not limited by statement timeouts.

### 5. Read path
- `public.list_audit_entries(p_tenant, p_from, p_to, p_actor, p_category, p_cursor, p_limit)` is `security definer` in an exposed schema:
  - it explicitly checks `app.has_role(p_tenant, '{secretary}')` or `app.is_platform_admin()`;
  - it paginates with keyset pagination on `(occurred_at, id)`.
- **CSV export:** a route handler streams pages from the same RPC. Values are neutralized against formula injection.
- **Grade timeline:** `public.grade_timeline(p_student, p_subject, p_term)` assembles three sources, with the same authorization as viewing the grade:
  - audit entries for the grade rows;
  - lock and reopen events (`grade_locks` is audited);
  - correction requests and their decisions.

  The steps are lançada → (alterada) → fechada → retificada / reaberta.

### 6. What is audited
- **Grades:** grades, recovery grades, grade locks (close and reopen with reason), correction requests and decisions.
- **Enrollment:** enrollments and enrollment events (new, reassigned, transferred, cancelled, reactivated).
- **People:** students and guardian links.
- **Settings:** school settings, assessment compositions and categories, tenant code changes, memberships (grant, revoke, role change).
- **Access:** invitations (sent, resent, revoked, accepted) and the access events from §2.
- **Other:** attendance records (changes after the initial save, and offline-sync conflicts), absence-justification decisions, incidents, announcements, issued documents, and data-subject requests.

### 7. Retention and the demo
- Production entries are retained indefinitely: they are school records. The volume is small (text and jsonb).
- The public demo lives in a **separate Supabase project** that is wiped daily ([ADR-0006](0006-environments-and-demo.md)). Production therefore needs **no exception** to append-only.

## Consequences

### Positive
- The audit trail cannot be bypassed by application code: every write path to an audited table fires the trigger, including RPCs, the service role and future code.
- Tampering with rows is detectable by chain verification. Deletion and update are blocked outright.
- One mechanism powers four features: the audit screen, the dashboard activity feed, the grade timeline and accountability exports.

### Negative and trade-offs
- **Contention.** The per-tenant advisory lock is held until commit. A grade-sheet save (about 28 students × 4 categories = 112 rows) serializes audit inserts for that tenant for a few milliseconds.
  - Target: p95 under 300 ms for a 112-row save with 5 concurrent teachers in one tenant, benchmarked in M1.
  - Fallback: statement-level triggers with transition tables, writing one audit row per statement holding an array of row diffs.
- **Limitation.** A database superuser (platform operator) could disable the triggers or rewrite an entire chain consistently. Chain verification detects partial edits but not a full, consistent rewrite.
  - Mitigation, on the ROADMAP: periodically anchor each tenant's chain head (seq and hash) outside the database, for example in a signed daily export or a public commit.
- Larger write volume per mutation, which is acceptable at school scale.

### Follow-ups
- M1: tables, roles, triggers, the chain and verification, pgTAP and the benchmark.
- M4: the dashboard activity feed.
- M7: the audit screen, CSV export, super-admin verification and the grade timeline.

## Alternatives considered
- **Application-level logging (Server Actions writing logs).** The spec forbids it, and any missed code path would leave a silent gap. Rejected.
- **Supabase's `supa_audit` / pgAudit.**
  - pgAudit writes to Postgres logs: not queryable per tenant, not chained.
  - `supa_audit` has no chain, no immutability guarantees against the service role, and no per-tenant model.
  - Rejected, though `supa_audit` is a useful reference.
- **A single global chain.** It is simpler to verify, but all tenants contend for one lock and per-tenant export is impossible. Rejected.
- **Asynchronous sealing** (rows inserted unhashed, a job chains them later). It leaves a window of unsealed rows and departs from "each record stores the previous hash". Rejected.
- **External ledger services.** Cost and vendor coupling. Only anchoring is considered, on the ROADMAP.

## Verification
- **pgTAP (CI-blocking):**
  - `UPDATE`, `DELETE` and `TRUNCATE` on `audit.audit_log` fail for `authenticated`, `anon`, `service_role` and `postgres`, through both the guard triggers and the privileges;
  - `SELECT` is denied except through the RPCs;
  - every audited table produces an entry on insert, update and delete, with the correct actor, category and diff;
  - redacted columns never appear in clear text;
  - `seq` is gapless per tenant and `verify_chain` returns `ok`;
  - a simulated tamper is detected:
    - the verification core is a function over a set of chain rows;
    - the test copies a tenant's chain into a temporary table, alters one row's payload, and asserts that the exact broken `seq` is reported;
    - live rows are never touched, and no superuser or trigger disabling is needed;
  - `log_access_event` cannot be executed by `authenticated` or `anon`.
- **Benchmark (M1):** the concurrent-save scenario stays within the target above.
- **E2E (M7):** the audit filters and empty state, the CSV download, the grade timeline after close → correction → reopen, and super-admin verification.
