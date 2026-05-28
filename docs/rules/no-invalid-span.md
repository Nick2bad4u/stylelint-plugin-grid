# no-invalid-span

Disallow non-positive `span` counts in CSS Grid placement declarations.

Grid spans must move across at least one track. Values such as `span 0` and
`span -1` cannot place an item usefully and usually make the declaration
invalid or ignored.

## Incorrect

```css
.item {
  grid-column: span 0 / span 2;
}
```

```css
.item {
  grid-row-start: span -1;
}
```

## Correct

```css
.item {
  grid-column: span 2 / sidebar-end;
}
```

```css
.item {
  grid-row-start: span var(--rows);
}
```

## Stylelint Config

```js
export default {
  plugins: ["stylelint-plugin-grid"],
  rules: {
    "grid/no-invalid-span": true
  }
};
```

## Related Rules

- [`no-zero-grid-lines`](./no-zero-grid-lines.md) rejects line `0` in placement
  values.
- [`no-reversed-placement-lines`](./no-reversed-placement-lines.md) checks
  numeric placement ranges.
- [`grid-recommended`](./configs/grid-recommended.md) enables this rule by
  default.
