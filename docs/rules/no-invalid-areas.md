# no-invalid-areas

Disallow malformed `grid-template-areas` declarations.

This rule reports:

- values without quoted row strings
- row strings with different column counts
- area tokens that are neither valid custom identifiers nor blank `.` markers

## Incorrect

```css
.layout {
  grid-template-areas:
    "header header"
    "nav";
}
```

```css
.layout {
  grid-template-areas: "main 1bad";
}
```

## Correct

```css
.layout {
  grid-template-areas:
    "header header"
    "nav main";
}
```

## Stylelint Config

```js
export default {
  plugins: ["stylelint-plugin-grid"],
  rules: {
    "grid/no-invalid-areas": true
  }
};
```

## Related Rules

- [`validate-area-shapes`](./validate-area-shapes.md) checks whether parsed named
  areas form rectangles.
- [`validate-track-counts`](./validate-track-counts.md) compares parsed template
  dimensions with sibling track declarations.
- [`grid-recommended`](./configs/grid-recommended.md) enables this rule by
  default.
