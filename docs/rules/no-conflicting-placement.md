# no-conflicting-placement

Disallow same-block CSS Grid placement declarations that write the same
placement slot.

Grid placement shorthands and longhands override shared row and column slots.
Keeping competing declarations in one block usually leaves stale CSS behind and
makes later edits risky. Use one placement strategy per block.

## Incorrect

```css
.item {
  grid-area: sidebar;
  grid-column: 2 / 4;
}
```

```css
.item {
  grid-column: 1 / 3;
  grid-column-start: 2;
}
```

## Correct

```css
.item {
  grid-area: sidebar;
}
```

```css
.item {
  grid-row: 1 / 3;
  grid-column: 2 / 4;
}
```

## Stylelint Config

```js
export default {
  plugins: ["stylelint-plugin-grid"],
  rules: {
    "grid/no-conflicting-placement": true
  }
};
```

## Related Rules

- [`no-reversed-placement-lines`](./no-reversed-placement-lines.md) checks
  numeric placement ranges.
- [`no-zero-grid-lines`](./no-zero-grid-lines.md) rejects line `0` in placement
  values.
- [`grid-recommended`](./configs/grid-recommended.md) enables this rule by
  default.
