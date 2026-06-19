---
title: Configs
description: Shareable Stylelint configs exported by stylelint-plugin-grid.
---

# Configs

`stylelint-plugin-grid` exports two ESM-first shareable configs.

| Config                                                                | Purpose                                                              |
| --------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [🟢 — `gridPluginConfigs["grid-recommended"]`](./grid-recommended.md) | Low-noise checks for broadly applicable CSS Grid correctness.        |
| [🟣 — `gridPluginConfigs["grid-all"]`](./grid-all.md)                 | Every public rule, including stricter same-stylesheet policy checks. |

Use `grid-recommended` first, then move selected stricter rules into your local
config after confirming they match your project's file boundaries.

## Config Pages

- [`grid-recommended`](./grid-recommended.md) enables the low-noise baseline.
- [`grid-all`](./grid-all.md) enables every public rule, including same-stylesheet
  policy checks.
- [Current status](../guides/current-status.md) explains why some rules are kept
  out of the recommended config.

## Rules by Config

**Fix legend:** 🔧 = autofixable · — = report only

**Config legend:** ✅ = enabled · — = not enabled

| Rule                                                                                     | Fix | [`grid-all`](./grid-all.md) | [`grid-recommended`](./grid-recommended.md) | Description                                                                                                              |
| ---------------------------------------------------------------------------------------- | :-: | :-------------------------: | :-----------------------------------------: | ------------------------------------------------------------------------------------------------------------------------ |
| [`consistent-area-naming`](../consistent-area-naming.md)                                 |  —  |             ✅              |                      —                      | Require consistent naming for `grid-template-areas` and single-name `grid-area` identifiers.                             |
| [`no-conflicting-placement`](../no-conflicting-placement.md)                             |  —  |             ✅              |                     ✅                      | Disallow same-block CSS Grid placement declarations that write the same placement slot.                                  |
| [`no-dense-auto-flow`](../no-dense-auto-flow.md)                                         |  —  |             ✅              |                      —                      | Disallow `grid-auto-flow: dense` because it can reorder auto-placed grid items visually.                                 |
| [`no-ineffective-container-properties`](../no-ineffective-container-properties.md)       |  —  |             ✅              |                     ✅                      | Disallow CSS Grid container declarations in blocks whose final literal display value is not grid-capable.                |
| [`no-invalid-areas`](../no-invalid-areas.md)                                             |  —  |             ✅              |                     ✅                      | Disallow malformed `grid-template-areas` declarations.                                                                   |
| [`no-invalid-auto-repeat`](../no-invalid-auto-repeat.md)                                 |  —  |             ✅              |                     ✅                      | Disallow definitely invalid CSS Grid auto-repeat track sizes.                                                            |
| [`no-invalid-minmax`](../no-invalid-minmax.md)                                           |  —  |             ✅              |                     ✅                      | Disallow flexible `fr` values as the minimum argument in CSS Grid `minmax()` track sizes.                                |
| [`no-invalid-repeat-count`](../no-invalid-repeat-count.md)                               |  —  |             ✅              |                     ✅                      | Disallow invalid fixed repeat counts in CSS Grid track templates.                                                        |
| [`no-invalid-span`](../no-invalid-span.md)                                               |  —  |             ✅              |                     ✅                      | Disallow non-positive `span` counts in CSS Grid placement declarations.                                                  |
| [`no-mismatched-template-rows`](../no-mismatched-template-rows.md)                       |  —  |             ✅              |                     ✅                      | Require `grid-template-rows` track count to match `grid-template-areas` row count.                                       |
| [`no-overlapping-areas`](../no-overlapping-areas.md)                                     |  —  |             ✅              |                      —                      | Disallow multiple selectors assigning the same single-name `grid-area` value in one stylesheet.                          |
| [`no-reversed-placement-lines`](../no-reversed-placement-lines.md)                       |  —  |             ✅              |                     ✅                      | Disallow reversed or zero-width numeric CSS Grid placement line ranges.                                                  |
| [`no-unknown-areas`](../no-unknown-areas.md)                                             |  —  |             ✅              |                     ✅                      | Disallow single-name `grid-area` references that do not match any named area declared in the same stylesheet.            |
| [`no-unused-areas`](../no-unused-areas.md)                                               |  —  |             ✅              |                      —                      | Disallow named template areas that are never referenced by a single-name `grid-area` declaration in the same stylesheet. |
| [`no-zero-grid-lines`](../no-zero-grid-lines.md)                                         |  —  |             ✅              |                     ✅                      | Disallow line `0` in CSS Grid placement declarations.                                                                    |
| [`prefer-gap-properties`](../prefer-gap-properties.md)                                   | 🔧  |             ✅              |                     ✅                      | Prefer modern `gap`, `row-gap`, and `column-gap` properties over legacy grid gap aliases.                                |
| [`prefer-minmax-zero-fr`](../prefer-minmax-zero-fr.md)                                   |  —  |             ✅              |                      —                      | Prefer `minmax(0, <flex>)` for bare flexible CSS Grid column tracks.                                                     |
| [`require-explicit-rows-with-column-flow`](../require-explicit-rows-with-column-flow.md) |  —  |             ✅              |                      —                      | Require explicit row sizing when a rule uses `grid-auto-flow: column`.                                                   |
| [`require-explicit-tracks-with-areas`](../require-explicit-tracks-with-areas.md)         |  —  |             ✅              |                      —                      | Require explicit track sizing alongside CSS Grid named area templates.                                                   |
| [`validate-area-shapes`](../validate-area-shapes.md)                                     |  —  |             ✅              |                     ✅                      | Require every named grid template area to form one contiguous rectangle.                                                 |
| [`validate-track-counts`](../validate-track-counts.md)                                   |  —  |             ✅              |                     ✅                      | Require template row and column track counts to match `grid-template-areas` dimensions.                                  |
