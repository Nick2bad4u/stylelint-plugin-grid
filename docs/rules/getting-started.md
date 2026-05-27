---
title: Getting Started
description: Install and configure stylelint-plugin-grid.
---

# Getting Started

Install the plugin next to Stylelint:

```sh
npm install --save-dev stylelint stylelint-plugin-grid
```

Use the recommended config for a low-noise baseline:

```js
import { gridPluginConfigs } from "stylelint-plugin-grid";

export default gridPluginConfigs["grid-recommended"];
```

Or extend a subpath config from a larger Stylelint config:

```js
export default {
  extends: ["stylelint-plugin-grid/configs/grid-recommended"]
};
```

Enable individual rules when you need a tighter policy:

```js
export default {
  plugins: ["stylelint-plugin-grid"],
  rules: {
    "grid/no-invalid-areas": true,
    "grid/validate-area-shapes": true,
    "grid/no-unused-areas": true
  }
};
```

## Recommended Starting Point

Start with `grid-recommended`. Add `grid-all` only after checking the same-file
assumptions in `grid/no-unused-areas`, `grid/no-overlapping-areas`, and
`grid/consistent-area-naming` against your project structure.

## Related Docs

- [Config reference](./configs/) explains what each exported config enables.
- [Current status](./guides/current-status.md) documents what the rules skip on
  purpose.
- [`grid/no-invalid-areas`](./no-invalid-areas.md) is the first rule to understand
because stricter template rules depend on parseable rows.
