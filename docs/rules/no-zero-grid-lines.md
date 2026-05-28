# no-zero-grid-lines

Disallow line `0` in CSS Grid placement declarations.

CSS Grid line numbering starts at `1` from the start edge and `-1` from the end
edge. Line `0` does not exist, so placement values using `0` are invalid.

## Incorrect

```css
.item {
  grid-column: 0 / 2;
}
```

```css
.item {
  grid-row-end: 0;
}
```

## Correct

```css
.item {
  grid-column: 1 / -1;
}
```

```css
.item {
  grid-row: var(--row-start) / var(--row-end);
}
```

## Stylelint Config

```js
export default {
  plugins: ["stylelint-plugin-grid"],
  rules: {
    "grid/no-zero-grid-lines": true
  }
};
```

## Related Rules

- [`no-invalid-span`](./no-invalid-span.md) rejects non-positive span counts.
- [`no-reversed-placement-lines`](./no-reversed-placement-lines.md) checks
  numeric placement ranges.
- [`grid-recommended`](./configs/grid-recommended.md) enables this rule by
  default.
