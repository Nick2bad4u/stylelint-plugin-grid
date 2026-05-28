# no-invalid-auto-repeat

Disallow definitely invalid CSS Grid auto-repeat track sizes.

CSS Grid auto-repeat only accepts fixed track sizes. This rule catches common
invalid patterns such as bare `fr` tracks and `minmax()` calls with intrinsic or
flexible minimums inside `repeat(auto-fit, ...)` or `repeat(auto-fill, ...)`.

The rule checks `grid-template-columns` and `grid-template-rows`. It avoids
reporting runtime-dependent values such as `var()` and `env()`.

## Incorrect

```css
.cards {
  grid-template-columns: repeat(auto-fit, 1fr);
}
```

```css
.cards {
  grid-template-columns: repeat(auto-fill, minmax(auto, 1fr));
}
```

## Correct

```css
.cards {
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
}
```

```css
.cards {
  grid-template-columns: repeat(auto-fill, [card] minmax(0, 1fr));
}
```

## Stylelint Config

```js
export default {
  plugins: ["stylelint-plugin-grid"],
  rules: {
    "grid/no-invalid-auto-repeat": true
  }
};
```

## Related Rules

- [`no-invalid-minmax`](./no-invalid-minmax.md) checks invalid `minmax()`
  minimums outside auto-repeat contexts too.
- [`validate-track-counts`](./validate-track-counts.md) compares explicit track
  counts with named area templates.
- [`grid-recommended`](./configs/grid-recommended.md) enables this rule by
  default.
