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
- Rules skip dynamic values such as `var(...)`, `repeat(auto-fit, ...)`, and
  multi-value `grid-area` line placement when static analysis would be
  unreliable.

## Deliberate Non-Goals

- Inferring component relationships across files.
- Guessing whether duplicate `grid-area` assignments are intentional overlays.
- Rewriting `grid-template-areas` strings automatically.

Those choices keep the plugin useful on save instead of turning it into a noisy
layout oracle.

## Related Docs

- [Getting Started](../getting-started.md) shows the recommended baseline config.
- [`grid-all`](../configs/grid-all.md) includes the stricter same-stylesheet rules.
- [`no-unused-areas`](../no-unused-areas.md),
  [`no-overlapping-areas`](../no-overlapping-areas.md), and
  [`consistent-area-naming`](../consistent-area-naming.md) are the main rules to
  review before opting into stricter policy checks.
