---
title: Grid-all
description: Complete shareable config for stylelint-plugin-grid.
---

# grid-all

`gridPluginConfigs["grid-all"]` enables every public rule exported by this
package.

## Usage

```js
import { gridPluginConfigs } from "stylelint-plugin-grid";

export default gridPluginConfigs["grid-all"];
```

Use this config after reading the
[current static-analysis boundaries](../guides/current-status.md). Projects that
split grid containers and items across files may prefer
[`grid-recommended`](./grid-recommended.md) plus selected stricter rules.

## Rules in this config

**Fix legend:** 🔧 = autofixable · — = report only

| Rule | Fix | Description |
| --- | :-: | --- |
| [`consistent-area-naming`](../consistent-area-naming.md) | — | Require consistent naming for `grid-template-areas` and single-name `grid-area` identifiers. |
| [`no-dense-auto-flow`](../no-dense-auto-flow.md) | — | Disallow `grid-auto-flow: dense` because it can reorder auto-placed grid items visually. |
| [`no-invalid-areas`](../no-invalid-areas.md) | — | Disallow malformed `grid-template-areas` declarations. |
| [`no-invalid-auto-repeat`](../no-invalid-auto-repeat.md) | — | Disallow definitely invalid CSS Grid auto-repeat track sizes. |
| [`no-invalid-minmax`](../no-invalid-minmax.md) | — | Disallow flexible `fr` values as the minimum argument in CSS Grid `minmax()` track sizes. |
| [`no-mismatched-template-rows`](../no-mismatched-template-rows.md) | — | Require `grid-template-rows` track count to match `grid-template-areas` row count. |
| [`no-overlapping-areas`](../no-overlapping-areas.md) | — | Disallow multiple selectors assigning the same single-name `grid-area` value in one stylesheet. |
| [`no-unknown-areas`](../no-unknown-areas.md) | — | Disallow single-name `grid-area` references that do not match any named area declared in the same stylesheet. |
| [`no-unused-areas`](../no-unused-areas.md) | — | Disallow named template areas that are never referenced by a single-name `grid-area` declaration in the same stylesheet. |
| [`prefer-gap-properties`](../prefer-gap-properties.md) | 🔧 | Prefer modern `gap`, `row-gap`, and `column-gap` properties over legacy grid gap aliases. |
| [`require-explicit-rows-with-column-flow`](../require-explicit-rows-with-column-flow.md) | — | Require explicit row sizing when a rule uses `grid-auto-flow: column`. |
| [`validate-area-shapes`](../validate-area-shapes.md) | — | Require every named grid template area to form one contiguous rectangle. |
| [`validate-track-counts`](../validate-track-counts.md) | — | Require template row and column track counts to match `grid-template-areas` dimensions. |
