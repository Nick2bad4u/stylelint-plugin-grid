# require-explicit-tracks-with-areas

Require explicit track sizing alongside CSS Grid named area templates.

Named area templates are easiest to maintain when their columns, and optionally
their rows, are sized in the same block. By default this rule requires
`grid-template-columns` and leaves rows optional because auto-sized rows are
common.

## Incorrect

```css
.layout {
  grid-template-areas: "nav main";
}
```

With `{ rows: true }`:

```css
.layout {
  grid-template-areas: "main";
  grid-template-columns: minmax(0, 1fr);
}
```

## Correct

```css
.layout {
  grid-template-areas: "nav main";
  grid-template-columns: auto minmax(0, 1fr);
}
```

With `{ rows: true }`:

```css
.layout {
  grid-template-areas: "main";
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto;
}
```

## Options

```js
export default {
  plugins: ["stylelint-plugin-grid"],
  rules: {
    "grid/require-explicit-tracks-with-areas": [
      true,
      {
        columns: true,
        rows: false
      }
    ]
  }
};
```

## Stylelint Config

```js
export default {
  plugins: ["stylelint-plugin-grid"],
  rules: {
    "grid/require-explicit-tracks-with-areas": true
  }
};
```

## Related Rules

- [`no-mismatched-template-rows`](./no-mismatched-template-rows.md) compares
  named area rows with `grid-template-rows`.
- [`validate-track-counts`](./validate-track-counts.md) compares named area
  columns and rows with explicit track counts.
- [`grid-all`](./configs/grid-all.md) enables this optional rule.
