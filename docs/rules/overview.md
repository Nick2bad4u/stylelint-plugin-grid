---
title: Overview
description: Overview of stylelint-plugin-grid and its package surface.
---

# stylelint-plugin-grid

`stylelint-plugin-grid` validates authored CSS Grid templates, area
assignments, and grid-specific compatibility patterns that generic declaration
rules do not understand.

The package intentionally focuses on static CSS that Stylelint can inspect
reliably: `grid-template-areas`, sibling template track declarations, and
single-name `grid-area` assignments.

## Exports

- A default Stylelint plugin pack export.
- A plugin-scoped shareable config map: `gridPluginConfigs`
  - `grid-recommended`
  - `grid-all`
- Static metadata exports: `meta`, `rules`, `ruleNames`, `ruleIds`, and
  `configNames`.

## Rule Families

The initial catalog covers:

- malformed `grid-template-areas` row strings and area tokens
- non-rectangular named areas
- invalid auto-repeat and `minmax()` track sizing syntax
- row and column track-count drift
- unknown or unused named area references
- duplicate single-name area assignments that can create overlapping grid items
- consistent grid area naming
- dense auto-placement patterns that can disconnect visual and source order
- column auto-placement blocks that omit explicit row sizing
- migration from legacy `grid-gap` aliases to modern gap properties

The package does not try to infer runtime layout across separate files,
framework conditionals, or class composition. Rules that need same-stylesheet
knowledge are kept out of `grid-recommended` unless their false-positive risk is
low.

## Next Steps

- [Install and configure the plugin](./getting-started.md).
- [Compare the shareable configs](./configs/).
- [Review the current static-analysis boundaries](./guides/current-status.md).
- Start with [`no-invalid-areas`](./no-invalid-areas.md),
  [`no-invalid-auto-repeat`](./no-invalid-auto-repeat.md),
  [`no-invalid-minmax`](./no-invalid-minmax.md),
  [`validate-area-shapes`](./validate-area-shapes.md), and
  [`validate-track-counts`](./validate-track-counts.md) for template correctness.
