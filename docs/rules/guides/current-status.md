---
title: Current Status
description: Current scope of the CSS Grid safety rule catalog.
---

# Current Status

The repository has been re-identified as `stylelint-plugin-grid` and now
ships a focused CSS Grid rule catalog.

## Stable Scope

- Grid area template parsing is intentionally conservative.
- Track-count validation handles explicit tracks and integer `repeat(...)`
  notation.
- Auto-repeat validation catches definitely invalid fixed-size mistakes while
  avoiding runtime-dependent `var(...)` and `env(...)` values.
- Rules skip dynamic values such as `var(...)`, `env(...)`, and multi-value
  `grid-area` line placement when static analysis would be unreliable.

## Deliberate Non-Goals

- Inferring component relationships across files.
- Guessing whether duplicate `grid-area` assignments are intentional overlays.
- Inferring row sizing for column auto-placement from other selectors or cascade
  branches.
- Rewriting `grid-template-areas` strings automatically.

Those choices keep the plugin useful on save instead of turning it into a noisy
layout oracle.

## Related Docs

- [Getting Started](../getting-started.md) shows the recommended baseline config.
- [`grid-all`](../configs/grid-all.md) includes the stricter same-stylesheet rules.
- [`no-invalid-auto-repeat`](../no-invalid-auto-repeat.md) and
  [`no-invalid-minmax`](../no-invalid-minmax.md) cover track sizing syntax that
  browsers can reject.
- [`no-dense-auto-flow`](../no-dense-auto-flow.md),
  [`require-explicit-rows-with-column-flow`](../require-explicit-rows-with-column-flow.md),
  [`no-unused-areas`](../no-unused-areas.md),
  [`no-overlapping-areas`](../no-overlapping-areas.md), and
  [`consistent-area-naming`](../consistent-area-naming.md) are the main rules to
  review before opting into stricter policy checks.
