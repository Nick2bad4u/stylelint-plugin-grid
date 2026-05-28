# no-reversed-placement-lines

Disallow reversed or zero-width numeric CSS Grid placement line ranges.

Numeric line ranges such as `grid-column: 4 / 2` and `grid-row: 3 / 3` do not
describe a forward span across tracks. This rule only compares plain numeric
line pairs in the same block and ignores named lines, spans, mixed signs, and
dynamic values.

## Incorrect

```css
.item {
  grid-column: 4 / 2;
}
```

```css
.item {
  grid-row-start: 7;
  grid-row-end: 6;
}
```

## Correct

```css
.item {
  grid-column: 2 / 4;
}
```

```css
.item {
  grid-row: span 2 / 5;
}
```

## Stylelint Config

```js
export default {
  plugins: ["stylelint-plugin-grid"],
  rules: {
    "grid/no-reversed-placement-lines": true
  }
};
```

## Related Rules

- [`no-invalid-span`](./no-invalid-span.md) rejects non-positive span counts.
- [`no-zero-grid-lines`](./no-zero-grid-lines.md) rejects line `0` in placement
  values.
- [`grid-recommended`](./configs/grid-recommended.md) enables this rule by
  default.
