# prefer-gap-properties

Prefer modern `gap`, `row-gap`, and `column-gap` over legacy grid gap aliases.

This rule is autofixable.

## Incorrect

```css
.layout {
  display: grid;
  grid-gap: 1rem;
  grid-column-gap: 2rem;
}
```

## Correct

```css
.layout {
  display: grid;
  gap: 1rem;
  column-gap: 2rem;
}
```

## Stylelint Config

```js
export default {
  plugins: ["stylelint-plugin-grid"],
  rules: {
    "grid/prefer-gap-properties": true
  }
};
```

## Related Docs

- [Getting Started](./getting-started.md) shows how to enable the recommended
  baseline.
- [`grid-recommended`](./configs/grid-recommended.md) enables this autofixable rule
  by default.
- [`validate-track-counts`](./validate-track-counts.md) covers template dimensions
  after gap declarations are modernized.
