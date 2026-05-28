# no-invalid-repeat-count

Disallow invalid fixed repeat counts in CSS Grid track templates.

The first argument to a fixed `repeat()` must be a positive integer. Counts such
as `0`, negative numbers, and decimals make the track template invalid. This
rule leaves `auto-fit`, `auto-fill`, and dynamic values to the rules that own
those cases.

## Incorrect

```css
.layout {
  grid-template-columns: repeat(0, 1fr);
}
```

```css
.layout {
  grid-template-rows: repeat(2.5, auto);
}
```

## Correct

```css
.layout {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
```

```css
.layout {
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
}
```

## Stylelint Config

```js
export default {
  plugins: ["stylelint-plugin-grid"],
  rules: {
    "grid/no-invalid-repeat-count": true
  }
};
```

## Related Rules

- [`no-invalid-auto-repeat`](./no-invalid-auto-repeat.md) checks track sizes
  inside `repeat(auto-fit, ...)` and `repeat(auto-fill, ...)`.
- [`validate-track-counts`](./validate-track-counts.md) compares expanded track
  counts with named area templates.
- [`grid-recommended`](./configs/grid-recommended.md) enables this rule by
  default.
