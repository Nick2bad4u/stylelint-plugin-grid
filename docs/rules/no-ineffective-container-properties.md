# no-ineffective-container-properties

Disallow CSS Grid container declarations in blocks whose final literal
`display` value is not grid-capable.

Properties such as `grid-template-columns` and `grid-auto-flow` only define a
grid container when the element computes to `display: grid` or
`display: inline-grid`. If the same block ends with `display: contents`,
`display: flex`, or another known non-grid value, those declarations are
ineffective.

## Incorrect

```css
.layout {
  display: contents;
  grid-template-columns: 1fr 1fr;
}
```

```css
.layout {
  display: grid;
  display: flex;
  grid-template-areas: "main side";
}
```

## Correct

```css
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 16rem;
}
```

```css
.layout {
  display: var(--layout-display);
  grid-template-areas: "main";
}
```

## Stylelint Config

```js
export default {
  plugins: ["stylelint-plugin-grid"],
  rules: {
    "grid/no-ineffective-container-properties": true
  }
};
```

## Related Rules

- [`validate-track-counts`](./validate-track-counts.md) compares explicit track
  counts with named area templates.
- [`require-explicit-tracks-with-areas`](./require-explicit-tracks-with-areas.md)
  requires explicit track sizing for named area templates.
- [`grid-recommended`](./configs/grid-recommended.md) enables this rule by
  default.
