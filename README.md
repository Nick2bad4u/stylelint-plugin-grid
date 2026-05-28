# stylelint-plugin-grid

[![npm license.](https://flat.badgen.net/npm/license/stylelint-plugin-grid?color=0f766e)](https://github.com/Nick2bad4u/stylelint-plugin-grid/blob/main/LICENSE) [![npm total downloads.](https://flat.badgen.net/npm/dt/stylelint-plugin-grid?color=f43f5e)](https://www.npmjs.com/package/stylelint-plugin-grid) [![latest GitHub release.](https://flat.badgen.net/github/release/Nick2bad4u/stylelint-plugin-grid?color=22d3ee)](https://github.com/Nick2bad4u/stylelint-plugin-grid/releases) [![GitHub stars.](https://flat.badgen.net/github/stars/Nick2bad4u/stylelint-plugin-grid?color=f59e0b)](https://github.com/Nick2bad4u/stylelint-plugin-grid/stargazers) [![GitHub forks.](https://flat.badgen.net/github/forks/Nick2bad4u/stylelint-plugin-grid?color=84cc16)](https://github.com/Nick2bad4u/stylelint-plugin-grid/forks) [![GitHub open issues.](https://flat.badgen.net/github/open-issues/Nick2bad4u/stylelint-plugin-grid?color=d946ef)](https://github.com/Nick2bad4u/stylelint-plugin-grid/issues) [![codecov.](https://flat.badgen.net/codecov/github/Nick2bad4u/stylelint-plugin-grid?color=0ea5e9)](https://codecov.io/gh/Nick2bad4u/stylelint-plugin-grid)

Stylelint rules for CSS Grid correctness, safer named-area patterns, and common
layout bug prevention.

## Install

```sh
npm install --save-dev stylelint stylelint-plugin-grid
```

## Usage

Use the recommended config:

```js
import { gridPluginConfigs } from "stylelint-plugin-grid";

export default gridPluginConfigs["grid-recommended"];
```

Or use the subpath config:

```js
export default {
  extends: ["stylelint-plugin-grid/configs/grid-recommended"]
};
```

Enable individual rules directly:

```js
export default {
  plugins: ["stylelint-plugin-grid"],
  rules: {
    "grid/no-invalid-areas": true,
    "grid/validate-area-shapes": true,
    "grid/validate-track-counts": true
  }
};
```

## Exports

- default plugin pack export
- `gridPluginConfigs`
- `configNames`, `ruleNames`, `ruleIds`, `rules`, and `meta`
- `stylelint-plugin-grid/configs/grid-recommended`
- `stylelint-plugin-grid/configs/grid-all`

## Configs

| Config                                  | Purpose                                                                       |
| --------------------------------------- | ----------------------------------------------------------------------------- |
| `gridPluginConfigs["grid-recommended"]` | Low-noise correctness checks for authored Grid templates and area references. |
| `gridPluginConfigs["grid-all"]`         | Every public rule, including stricter same-stylesheet checks.                 |

## Rules

**Fix legend:**

- 🔧 = autofixable
- — = report only

**Preset key legend:**

- [🟢](./docs/rules/configs/grid-recommended.md) — `gridPluginConfigs["grid-recommended"]`
- [🟣](./docs/rules/configs/grid-all.md) — `gridPluginConfigs["grid-all"]`

| Rule | Fix | Preset key | Description |
| --- | :-: | --- | --- |
| [`consistent-area-naming`](https://nick2bad4u.github.io/stylelint-plugin-grid/docs/rules/consistent-area-naming) | — | [🟣](./docs/rules/configs/grid-all.md) | Require consistent naming for `grid-template-areas` and single-name `grid-area` identifiers. |
| [`no-conflicting-placement`](https://nick2bad4u.github.io/stylelint-plugin-grid/docs/rules/no-conflicting-placement) | — | [🟢](./docs/rules/configs/grid-recommended.md) [🟣](./docs/rules/configs/grid-all.md) | Disallow same-block CSS Grid placement declarations that write the same placement slot. |
| [`no-dense-auto-flow`](https://nick2bad4u.github.io/stylelint-plugin-grid/docs/rules/no-dense-auto-flow) | — | [🟣](./docs/rules/configs/grid-all.md) | Disallow `grid-auto-flow: dense` because it can reorder auto-placed grid items visually. |
| [`no-ineffective-container-properties`](https://nick2bad4u.github.io/stylelint-plugin-grid/docs/rules/no-ineffective-container-properties) | — | [🟢](./docs/rules/configs/grid-recommended.md) [🟣](./docs/rules/configs/grid-all.md) | Disallow CSS Grid container declarations in blocks whose final literal display value is not grid-capable. |
| [`no-invalid-areas`](https://nick2bad4u.github.io/stylelint-plugin-grid/docs/rules/no-invalid-areas) | — | [🟢](./docs/rules/configs/grid-recommended.md) [🟣](./docs/rules/configs/grid-all.md) | Disallow malformed `grid-template-areas` declarations. |
| [`no-invalid-auto-repeat`](https://nick2bad4u.github.io/stylelint-plugin-grid/docs/rules/no-invalid-auto-repeat) | — | [🟢](./docs/rules/configs/grid-recommended.md) [🟣](./docs/rules/configs/grid-all.md) | Disallow definitely invalid CSS Grid auto-repeat track sizes. |
| [`no-invalid-minmax`](https://nick2bad4u.github.io/stylelint-plugin-grid/docs/rules/no-invalid-minmax) | — | [🟢](./docs/rules/configs/grid-recommended.md) [🟣](./docs/rules/configs/grid-all.md) | Disallow flexible `fr` values as the minimum argument in CSS Grid `minmax()` track sizes. |
| [`no-invalid-repeat-count`](https://nick2bad4u.github.io/stylelint-plugin-grid/docs/rules/no-invalid-repeat-count) | — | [🟢](./docs/rules/configs/grid-recommended.md) [🟣](./docs/rules/configs/grid-all.md) | Disallow invalid fixed repeat counts in CSS Grid track templates. |
| [`no-invalid-span`](https://nick2bad4u.github.io/stylelint-plugin-grid/docs/rules/no-invalid-span) | — | [🟢](./docs/rules/configs/grid-recommended.md) [🟣](./docs/rules/configs/grid-all.md) | Disallow non-positive `span` counts in CSS Grid placement declarations. |
| [`no-mismatched-template-rows`](https://nick2bad4u.github.io/stylelint-plugin-grid/docs/rules/no-mismatched-template-rows) | — | [🟢](./docs/rules/configs/grid-recommended.md) [🟣](./docs/rules/configs/grid-all.md) | Require `grid-template-rows` track count to match `grid-template-areas` row count. |
| [`no-overlapping-areas`](https://nick2bad4u.github.io/stylelint-plugin-grid/docs/rules/no-overlapping-areas) | — | [🟣](./docs/rules/configs/grid-all.md) | Disallow multiple selectors assigning the same single-name `grid-area` value in one stylesheet. |
| [`no-reversed-placement-lines`](https://nick2bad4u.github.io/stylelint-plugin-grid/docs/rules/no-reversed-placement-lines) | — | [🟢](./docs/rules/configs/grid-recommended.md) [🟣](./docs/rules/configs/grid-all.md) | Disallow reversed or zero-width numeric CSS Grid placement line ranges. |
| [`no-unknown-areas`](https://nick2bad4u.github.io/stylelint-plugin-grid/docs/rules/no-unknown-areas) | — | [🟢](./docs/rules/configs/grid-recommended.md) [🟣](./docs/rules/configs/grid-all.md) | Disallow single-name `grid-area` references that do not match any named area declared in the same stylesheet. |
| [`no-unused-areas`](https://nick2bad4u.github.io/stylelint-plugin-grid/docs/rules/no-unused-areas) | — | [🟣](./docs/rules/configs/grid-all.md) | Disallow named template areas that are never referenced by a single-name `grid-area` declaration in the same stylesheet. |
| [`no-zero-grid-lines`](https://nick2bad4u.github.io/stylelint-plugin-grid/docs/rules/no-zero-grid-lines) | — | [🟢](./docs/rules/configs/grid-recommended.md) [🟣](./docs/rules/configs/grid-all.md) | Disallow line `0` in CSS Grid placement declarations. |
| [`prefer-gap-properties`](https://nick2bad4u.github.io/stylelint-plugin-grid/docs/rules/prefer-gap-properties) | 🔧 | [🟢](./docs/rules/configs/grid-recommended.md) [🟣](./docs/rules/configs/grid-all.md) | Prefer modern `gap`, `row-gap`, and `column-gap` properties over legacy grid gap aliases. |
| [`prefer-minmax-zero-fr`](https://nick2bad4u.github.io/stylelint-plugin-grid/docs/rules/prefer-minmax-zero-fr) | — | [🟣](./docs/rules/configs/grid-all.md) | Prefer `minmax(0, <flex>)` for bare flexible CSS Grid column tracks. |
| [`require-explicit-rows-with-column-flow`](https://nick2bad4u.github.io/stylelint-plugin-grid/docs/rules/require-explicit-rows-with-column-flow) | — | [🟣](./docs/rules/configs/grid-all.md) | Require explicit row sizing when a rule uses `grid-auto-flow: column`. |
| [`require-explicit-tracks-with-areas`](https://nick2bad4u.github.io/stylelint-plugin-grid/docs/rules/require-explicit-tracks-with-areas) | — | [🟣](./docs/rules/configs/grid-all.md) | Require explicit track sizing alongside CSS Grid named area templates. |
| [`validate-area-shapes`](https://nick2bad4u.github.io/stylelint-plugin-grid/docs/rules/validate-area-shapes) | — | [🟢](./docs/rules/configs/grid-recommended.md) [🟣](./docs/rules/configs/grid-all.md) | Require every named grid template area to form one contiguous rectangle. |
| [`validate-track-counts`](https://nick2bad4u.github.io/stylelint-plugin-grid/docs/rules/validate-track-counts) | — | [🟢](./docs/rules/configs/grid-recommended.md) [🟣](./docs/rules/configs/grid-all.md) | Require template row and column track counts to match `grid-template-areas` dimensions. |

## Documentation

- [Overview](./docs/rules/overview.md)
- [Getting Started](./docs/rules/getting-started.md)
- [Current Status](./docs/rules/guides/current-status.md)
- [Configs](./docs/rules/configs/index.md)
