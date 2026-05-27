# validate-area-shapes

Require every named grid template area to form one contiguous rectangle.

CSS Grid rejects non-rectangular areas. This rule catches the problem at the
authored template declaration instead of leaving it to browser behavior.

## Incorrect

```css
.layout {
  grid-template-areas:
    "main side"
    "main main";
}
```

## Correct

```css
.layout {
  grid-template-areas:
    "main side"
    "main side";
}
```

## Stylelint Config

```js
export default {
  plugins: ["stylelint-plugin-grid"],
  rules: {
    "grid/validate-area-shapes": true
  }
};
```

## Related Rules

- [`no-invalid-areas`](./no-invalid-areas.md) catches malformed template strings
  before shape validation matters.
- [`validate-track-counts`](./validate-track-counts.md) checks the track dimensions
  for the same template.
- [`no-mismatched-template-rows`](./no-mismatched-template-rows.md) focuses only on
  row-count drift.
