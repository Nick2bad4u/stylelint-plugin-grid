# no-invalid-minmax

Disallow flexible `fr` values as the minimum argument in CSS Grid `minmax()`
track sizes.

In CSS Grid track sizing, the first `minmax()` argument must be an inflexible
minimum. A value such as `minmax(1fr, 20rem)` is invalid and can cause the
browser to ignore the declaration. Use an inflexible minimum such as `0`, a
length, or a percentage instead.

## Incorrect

```css
.layout {
  grid-template-columns: minmax(1fr, 20rem) 2fr;
}
```

```css
.layout {
  grid-auto-rows: minmax(0.5fr, auto);
}
```

## Correct

```css
.layout {
  grid-template-columns: minmax(0, 1fr) minmax(12rem, 20rem);
}
```

```css
.layout {
  grid-auto-rows: minmax(10rem, auto);
}
```

## Stylelint Config

```js
export default {
  plugins: ["stylelint-plugin-grid"],
  rules: {
    "grid/no-invalid-minmax": true
  }
};
```

## Related Rules

- [`no-invalid-auto-repeat`](./no-invalid-auto-repeat.md) checks auto-repeat
  track sizes that must be fixed.
- [`validate-track-counts`](./validate-track-counts.md) compares explicit track
  counts with named area templates.
- [`grid-recommended`](./configs/grid-recommended.md) enables this rule by
  default.
