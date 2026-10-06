# ADR-0007: AA-compliant adjustments to the v2 palette

- Status: Accepted (2026-10-06)
- Date: 2026-10-06
- Deciders: owner, engineer
- Product confirmation: the owner chose "Ajustar para AA" on 2026-10-06
- Related: spec §2.2, §5 ("WCAG 2.2 AA … zero violações de axe"); `docs/design/README.md` (Design Tokens → Cores); [ADR-0001](0001-technology-stack.md)

## Context

Two non-negotiable requirements conflict:

- **pixel-perfect fidelity** to the v2 handoff, including exact colors;
- **WCAG 2.2 AA with zero axe violations**: a contrast of at least 4.5:1 for text under 18.66 px bold / 24 px regular.

While building the Storybook foundations in M0, axe flagged `color-contrast` on table headers. Measuring every text/background pair the prototype uses for small text (relative luminance, WCAG formula) showed the gaps:

| Pair (small text)                                          | Ratio | AA   |
| ---------------------------------------------------------- | ----- | ---- |
| `muted` #6B7C93 on surface #FFFFFF                         | 4.26  | fail |
| `muted` on bg #F4F6FA                                      | 3.94  | fail |
| `muted` on line-soft #EFF2F7 (neutral pill)                | 3.80  | fail |
| `subtle` #93A1B5 on surface (helper text in the prototype) | 2.62  | fail |
| `success` #12855C on success-tint #E7F3ED (status pill)    | 4.07  | fail |
| `petrol` #0E8B7A on surface                                | 4.21  | fail |
| `petrol` on petrol-tint #E4F2EF (status pill)              | 3.65  | fail |
| white on `petrol` (buttons, toggles)                       | 4.21  | fail |

Everything else passes: primary, warning, danger, violet, ink, ink-2, white on primary/success/danger, and the dark-panel text colors.

`muted` is described in the handoff as "mínimo para texto pequeno", and it is used in nearly every screen: secondary text, table headers, neutral pills. Keeping it as-is would make "zero axe violations" impossible.

## Decision

Darken the three failing foreground tokens **within the same hue**, by the smallest amount that passes 4.5:1 on every surface where they appear. Hover variants keep the handoff's darkening ratio.

| Token           | Handoff | Adopted     | Worst-case ratio after                                     |
| --------------- | ------- | ----------- | ---------------------------------------------------------- |
| `muted`         | #6B7C93 | **#607084** | ≥ 4.5 on surface, bg, surface-2, surface-header, line-soft |
| `success`       | #12855C | **#117D56** | ≥ 4.5 on surface and success-tint                          |
| `success-hover` | #0E6E4C | **#0E6847** | (darker than `success`)                                    |
| `petrol`        | #0E8B7A | **#0C7A6B** | ≥ 4.5 on surface and petrol-tint; white on petrol ≥ 4.5    |
| `petrol-hover`  | #0B7163 | **#0A6357** | (darker than `petrol`)                                     |

**Usage rule for `subtle` (#93A1B5):** large text only (≥ 24 px, or ≥ 18.66 px bold), decorative text, disabled states and non-text elements. Wherever the prototype uses `subtle` for small readable text (counters such as "mín. 20 caracteres", footnotes, helper hints), the implementation uses `muted`.

Unchanged: all tints, surfaces, lines, primary, warning, danger, violet, ink and the dark-panel colors.

## Consequences

### Positive

- The design system is AA-compliant by construction. axe can stay a blocking gate in E2E and Storybook.
- The shift is subtle: each color keeps its hue and gets about 9–10% darker. The overall look of the handoff is preserved.

### Negative and trade-offs

- The implementation is no longer byte-identical to the prototype for these tokens. Side-by-side fidelity reviews must account for it.
- Small helper texts that were very light gray in the prototype (`subtle`) are slightly darker (`muted`).

### Follow-ups

- M3: Storybook story tests run axe on every component state (Vitest addon). New color pairs are measured before they are introduced.
- If the owner later chooses a dark theme (ROADMAP), its tokens go through the same measurement.

## Alternatives considered

- **Keep the handoff's exact colors.** It violates WCAG AA on most screens and contradicts the zero-violations requirement. Rejected by the owner.
- **Adjust only `muted`.** It fixes the most frequent case but leaves success and petrol pills failing. Rejected by the owner.
- **Increase font weight or size instead of darkening.** It changes typography across the system, which is a larger deviation than a ~10% darkening.

## Verification

- `src/styles/tokens.css` and `src/lib/design-tokens.ts` carry the adopted values. The Storybook "Foundations/Colors" story shows them.
- axe (WCAG 2.2 AA tags) reports no `color-contrast` violations in the Foundations stories or on the E2E screens.
