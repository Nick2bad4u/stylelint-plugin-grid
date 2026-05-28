# no-dense-auto-flow

Disallow `grid-auto-flow: dense` because dense packing can reorder auto-placed
grid items visually.

Dense auto-placement backfills earlier holes with later items when they fit.
That can make the visual order differ from source order, which is risky for
keyboard navigation, reading order, and assistive technology expectations.

This rule intentionally checks only the explicit `grid-auto-flow` property. It
does not attempt to parse the `grid` shorthand, where quoted area names and
implicit grid syntax make a conservative static check much noisier.

## Incorrect

```css
.cards {
  grid-auto-flow: dense;
}
```

```css
.cards {
  grid-auto-flow: column dense;
}
```

## Correct

```css
.cards {
  grid-auto-flow: row;
}
```

```css
.cards {
  grid-auto-flow: column;
}
```

## Stylelint Config

```js
export default {
  plugins: ["stylelint-plugin-grid"],
  rules: {
    "grid/no-dense-auto-flow": true
  }
};
```

## Related Rules

- [`no-overlapping-areas`](./no-overlapping-areas.md) catches another class of
  layout-order hazards from duplicate named area assignments.
- [`grid-all`](./configs/grid-all.md) enables this stricter policy rule.
