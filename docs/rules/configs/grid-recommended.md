---
title: Grid-recommended
description: Recommended shareable config for stylelint-plugin-grid.
---

# grid-recommended

`gridPluginConfigs["grid-recommended"]` enables the low-noise CSS Grid rules
that are safe for most stylesheets.

## Usage

```js
import { gridPluginConfigs } from "stylelint-plugin-grid";

export default gridPluginConfigs["grid-recommended"];
```

This config is the default starting point from
[Getting Started](../getting-started.md). Move to [`grid-all`](./grid-all.md) only
after checking the same-file assumptions documented in
[Current Status](../guides/current-status.md).

## Rules in this config

**Fix legend:** 🔧 = autofixable · — = report only

| Rule | Fix | Description |
| --- | :-: | --- |
| [`no-invalid-areas`](../no-invalid-areas.md) | — | Disallow malformed `grid-template-areas` declarations. |
| [`no-mismatched-template-rows`](../no-mismatched-template-rows.md) | — | Require `grid-template-rows` track count to match `grid-template-areas` row count. |
| [`no-unknown-areas`](../no-unknown-areas.md) | — | Disallow single-name `grid-area` references that do not match any named area declared in the same stylesheet. |
| [`prefer-gap-properties`](../prefer-gap-properties.md) | 🔧 | Prefer modern `gap`, `row-gap`, and `column-gap` properties over legacy grid gap aliases. |
| [`validate-area-shapes`](../validate-area-shapes.md) | — | Require every named grid template area to form one contiguous rectangle. |
| [`validate-track-counts`](../validate-track-counts.md) | — | Require template row and column track counts to match `grid-template-areas` dimensions. |
