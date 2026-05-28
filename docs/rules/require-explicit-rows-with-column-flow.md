# require-explicit-rows-with-column-flow

Require explicit row sizing when a rule uses `grid-auto-flow: column`.

Column auto-placement fills columns instead of rows. Without row sizing in the
same block, browsers can create implicit tracks in surprising ways and produce a
single long row-like layout. This rule asks for either `grid-template-rows` or
`grid-auto-rows` next to the `grid-auto-flow: column` declaration.

This is intentionally an opt-in policy rule. It checks same-block declarations
only and does not try to infer row sizing from other selectors or media-query
cascade layers.

## Incorrect

```css
.cards {
  grid-auto-flow: column;
  grid-template-columns: repeat(3, 1fr);
}
```

## Correct

```css
.cards {
  grid-auto-flow: column;
  grid-auto-rows: minmax(10rem, auto);
}
```

```css
.cards {
  grid-auto-flow: column;
  grid-template-rows: repeat(3, minmax(0, 1fr));
}
```

## Stylelint Config

```js
export default {
  plugins: ["stylelint-plugin-grid"],
  rules: {
    "grid/require-explicit-rows-with-column-flow": true
  }
};
```

## Related Rules

- [`no-dense-auto-flow`](./no-dense-auto-flow.md) catches dense packing mode
  when source order safety matters.
- [`validate-track-counts`](./validate-track-counts.md) compares explicit track
  counts with named area templates.
- [`grid-all`](./configs/grid-all.md) enables this stricter policy rule.
