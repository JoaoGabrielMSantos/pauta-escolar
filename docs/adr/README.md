# Architecture Decision Records

This directory records the significant architectural and technical decisions for Pauta Escolar, using a lightweight [MADR](https://adr.github.io/madr/) format.

## Rules

- One decision per file: `NNNN-kebab-case-title.md`, numbered sequentially.
- The status is one of:
  - **Proposed:** awaiting owner review.
  - **Accepted:** in force.
  - **Superseded by ADR-NNNN:** replaced. The old file is kept, never rewritten.
  - **Deprecated:** no longer applies.
- An accepted ADR is immutable in substance. Correcting a typo is fine; changing the decision requires a new ADR that supersedes it.
- An obvious technical default can be decided by the engineer and recorded here.
- An ambiguous **product** decision is confirmed with the owner first, and the ADR cites the date of that confirmation.

## Index

| # | Title | Status | Date |
|---|---|---|---|
| [0001](0001-technology-stack.md) | Technology stack and version policy | Accepted | 2026-10-06 |
| [0002](0002-multi-tenancy.md) | Multi-tenancy: isolation, tenant resolution and RLS pattern | Accepted | 2026-10-06 |
| [0003](0003-authentication-and-identity.md) | Authentication and identity | Accepted | 2026-10-06 |
| [0004](0004-append-only-audit-log.md) | Append-only, hash-chained audit log | Accepted | 2026-10-06 |
| [0005](0005-grade-engine-and-scales.md) | Grade engine, scales, rounding and attendance rules | Accepted | 2026-10-06 |
| [0006](0006-environments-and-demo.md) | Environments, configuration and the public demo | Accepted | 2026-10-06 |

## Template

```markdown
# ADR-NNNN: Title

- Status: Proposed | Accepted | Superseded by ADR-XXXX | Deprecated
- Date: YYYY-MM-DD
- Deciders: <owner>, <engineer>
- Related: <ADRs, PLAN sections, spec sections>

## Context
What problem are we solving? What forces are at play (product, security, cost, time)?

## Decision
What we will do, stated precisely enough to implement and to test.

## Consequences
### Positive
### Negative / trade-offs
### Follow-ups

## Alternatives considered
Each with the reason it was rejected.

## Verification
How we will know the decision is implemented correctly (tests, checks, metrics).
```
