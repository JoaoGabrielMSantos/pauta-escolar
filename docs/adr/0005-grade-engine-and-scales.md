# ADR-0005: Grade engine, scales, rounding and attendance rules

- Status: Accepted (2026-10-06)
- Date: 2026-10-06
- Deciders: owner, engineer
- Product confirmation: numeric-only grade entry confirmed by the owner on 2026-10-06 ("só números")
- Related: spec §2.1(7), §2.1(8), §4.5; prototype `renderVals()` (grade sheet, recovery, boletim, attendance); [PLAN §6](../PLAN.md)

## Context

The design shows "trimestre" and a 0–10 scale. The "Nova escola" wizard, however, offers:
- three scales: `0 a 10`, `0 a 100`, `Conceitos A–E`;
- three period types: `Bimestres`, `Trimestres`, `Semestres`;
- a configurable minimum grade.

The spec requires a **scale-agnostic engine**:
- store a normalized numeric value;
- convert it for display;
- validate against the ceiling of the scale and of the category;
- hardcode nothing such as "3º tri".

pt-BR input must accept a comma ("5,5"). The same rules (recovery, totals, attendance) run in TypeScript (UI, previews) and in SQL (database-enforced values, the Radar), so they must give identical results.

The owner decided that **grades are always entered as numbers**. Concepts are not entered directly.

## Decision

### 1. Scales
| `school_settings.grade_scale` | Entry unit | Max | Entry decimals | Display |
|---|---|---|---|---|
| `0_10` | points | 10 | 1 (default) | number, `decimals` places (default 1) → "6,5" |
| `0_100` | points | 100 | 1 | number, `decimals` places (default 0) → "65" |
| `concept_a_e` | points on 0–10 | 10 | 1 | **concept letter**, via configurable bands; teachers still type numbers |

- **Concept bands** default to A ≥ 9,0 · B ≥ 7,5 · C ≥ 6,0 · D ≥ 4,0 · E < 4,0, on the 0–10 entry scale. They are stored normalized in `school_settings.concept_bands` and confirmed at M4.
- In `concept_a_e` schools the minimum grade is still numeric (default 6,0). The settings show it as "C (6,0)".
- **The grade sheet always shows numbers**, because teachers type numbers. Under `concept_a_e` a concept hint is shown next to each total.
- **The boletim, PDFs and the student and family portals show the concept**, with the numeric average available on demand.

### 2. Storage: normalized ratio
- Every score-like value is stored as a **ratio of the scale maximum** in `numeric(7,6)`, in `[0, 1]`:
  - grades;
  - category ceilings;
  - recovery grades;
  - the minimum grade;
  - the attention band;
  - concept band thresholds.
- Examples on a 0–10 scale: 6,5 → `0.650000`; a "Prova mensal" category worth 3,0 → `0.300000`.
- `numeric` is exact in Postgres. Composition sums such as 0.3 + 0.4 + 0.2 + 0.1 are exactly 1.

### 3. Arithmetic in TypeScript
- `src/domain` represents normalized values as **integer micro-units** (ratio × 10⁶), so sums and comparisons are exact. JavaScript floating point is never used for business comparisons.
- **Averages** are computed on those integers. The result is rounded **half-up** to the micro-unit, which matches Postgres `round(numeric, 6)`.
- **Parsing** (`parseDecimalBR`):
  - accepts `5,5`, `5.5`, ` 5,50 `, `10`;
  - rejects `5,5,5`, `abc`, negative values and more decimals than the scale allows;
  - converts to micro-units.
- **Formatting** (`formatDecimalBR`) rounds **half-up** to the display decimals and uses a comma.

### 4. Rounding and threshold comparisons
- **Every threshold comparison uses the value rounded to display precision.** This covers below the minimum, attention, recovery eligibility, approved after recovery and concept bands.
- What users see is therefore what gets evaluated. The prototype compares raw values, so a 5,97 average would display "6,0" yet be classified as "Recuperação". This decision removes that inconsistency.
- Rounding is half-up at the scale's display decimals. It is configurable per school later if needed.
- To confirm with the owner at M4, with the concept bands and term weights.

### 5. Composition (assessment categories)
- **Where it is defined:** a published composition belongs to the school as a default, or overrides it for a specific subject (design: "Exceções por disciplina").
- **Publishing requires** the category ceilings to sum to exactly `1.000000`. A database trigger enforces this.
- **UI messages:**
  - "Soma fechada em 10,0";
  - "Excede {scale max} em X";
  - "Faltam X pontos".
  - Values are expressed in scale units.
- **"Modo nota única"** is a composition with one category whose ceiling is `1`.
- **Changing a composition while grades exist:**
  - renaming a category is allowed;
  - changing ceilings revalidates the stored grades;
  - removing a category that has grades is blocked.

### 6. Term grade (per student, subject and term)
- **Total** = the sum of the category scores.
- **Validation:** each score must be between 0 and its category ceiling. The UI shows "! máx X" with `role="alert"`, and the database enforces the same rule with a check constraint plus a trigger.
- **Completeness:** the term grade is complete only when **every** category of the applicable composition has a score.
  - Until then the grade sheet shows "N campo(s) pendente(s)" and the total is partial.
  - A partial total never yields a situation.
- **Situation in the grade sheet** (complete only), using the rounded total `t`:
  - `t < min` → "↓ Abaixo da média";
  - `t < min + attention_band` → "! Atenção";
  - otherwise "✓ Aprovado".
- `attention_band` defaults to 10% of the scale, which is 1,0 on 0–10 and matches the prototype's `min + 1`.

### 7. Recovery (per term)
- **Eligible:** complete, and the rounded total is below the minimum (the prototype's `recBase`).
- `recovery_grade` must be between 0 and the scale maximum. A higher value turns the field red and blocks the save with the error toast. The prototype's "> 10" is generalized to the scale maximum.
- **Final term value** follows `school_settings.recovery_rule`:

  | Rule | Formula | Formula text shown to the user |
  |---|---|---|
  | `replace_if_higher` ("Substitui se for maior") | `max(m, r)` | "maior entre {m} e {r}" |
  | `average` ("Média entre as duas") | `(m + r) / 2` | "({m} + {r}) ÷ 2" |
  | `replace_capped_at_min` ("Substitui, limitada à média mínima") | `max(m, min(r, min))` | "maior entre {m} e {min(r, min)}" |

- **Result:**
  - rounded final ≥ min → "✓ Aprovado na recuperação";
  - otherwise "↓ Segue abaixo da média";
  - no recovery grade yet → "Aguardando nota".
- The plain-language explanation of each rule is copied verbatim from the prototype into `src/domain/recovery.ts`.

### 8. Annual average (informative in v1)
- The annual average is the **weighted mean of the final term values** (after recovery), using `terms.weight` (default 1, equal weights), over the terms that have a final value.
- The annual situation in the boletim uses the same thresholds:
  - "✓ Aprovado";
  - "! Atenção";
  - "↓ Recuperação".
- The attendance alert is shown alongside.
- There is **no annual closing, final recovery or conselho de classe in v1** (owner decision, 2026-10-06); see the ROADMAP.

### 9. Attendance rules
- Lessons given = the sum of `attendance_sessions.lesson_count`. Each record is P (presente), F (falta) or J (justificada).
- **Raw presence %** = `P / total`. It is shown as information.
- **Legal attendance %** = `(P + J) / total`.
  - Justified absences count as lessons given but **do not count against the legal minimum**, as the prototype states on the "Minha frequência" screen.
  - This percentage drives the alert and the Radar.
- **Colors and labels:**

  | Condition | Color | Label |
  |---|---|---|
  | legal % < `min_attendance` | danger | "Abaixo do limite legal" |
  | below `min_attendance + 10 p.p.` | warning | "Atenção" |
  | otherwise | success | "Dentro do limite" |

  The default `min_attendance` is 75. The warning band generalizes the prototype's 85 with a 75 minimum.
- To confirm with the owner at M5.

### 10. Term labels
- Labels derive from `term_type` and the ordinal:

  | `term_type` | Long label | Short label |
  |---|---|---|
  | bimester | "1º bimestre" | "1º bim" |
  | trimester | "2º trimestre" | "2º tri" |
  | semester | "1º semestre" | "1º sem" |

- No term label is hardcoded anywhere.

### 11. Parity between TypeScript and SQL
- SQL mirrors live in the `app` schema: `app.term_total`, `app.term_situation`, `app.apply_recovery_rule`, `app.attendance_rates` and, later, `app.risk_score`.
- The test cases live once, in `src/domain/__fixtures__/*.json`: inputs, expected outputs and formula text.
- **Vitest** runs the TypeScript functions against the fixtures.
- **`scripts/gen-parity-tests.ts`** generates `supabase/tests/generated/*.test.sql` (pgTAP) from the same fixtures.
- **CI** regenerates those files and fails if the result differs from what is committed.

## Consequences

### Positive
- One engine serves 0–10, 0–100 and concepts, with no special cases in the grade sheet.
- Exact arithmetic on both sides avoids floating-point surprises.
- Users never see a grade that contradicts its situation.
- The parity fixtures make TS/SQL drift a build failure instead of a production bug.

### Negative and trade-offs
- Normalized storage makes raw SQL harder to read. Debugging views show values converted to scale units.
- Concept schools still enter numbers. This was a deliberate owner choice; direct concept entry is on the ROADMAP.
- The rounding rule departs from the prototype's raw comparison. It is flagged for owner confirmation at M4.

### Follow-ups
- M1: `numeric(7,6)` columns, check constraints, the composition trigger and the SQL mirrors with parity tests.
- M4: confirm the concept bands, term weights and rounding with the owner. Build the configuration UI (Configurações, Composição da nota).
- M5: confirm the attendance rule with the owner. Build the grade sheet, recovery and attendance UIs on top of `src/domain`.

## Alternatives considered
- **Store raw values in the school's scale.** It breaks if a school changes its scale, and every comparison needs scale context. Rejected.
- **Canonical 0–10 storage.** Readable, but 0–100 schools would need extra precision and the semantics are less explicit. Rejected in favor of the ratio.
- **A decimal library (decimal.js or big.js) in TypeScript.** It works, but adds weight for a problem that integer micro-units solve. Rejected.
- **Direct concept entry.** Not chosen by the owner for v1.

## Verification
- **Vitest:** `src/domain` at 100% coverage, including the edge cases:
  - "5,95"/"5,97" around the minimum;
  - every ceiling boundary;
  - empty categories;
  - all three recovery rules with r < m, r = m and r > m, and with r above the minimum under the capped rule;
  - 0–100 and concept displays;
  - invalid inputs.
- **pgTAP:** the generated parity tests pass; the check constraints reject out-of-range scores; publishing a composition that does not sum to 1 fails.
- **E2E (M5):** the grade sheet validation messages and situations match the prototype copy exactly.
