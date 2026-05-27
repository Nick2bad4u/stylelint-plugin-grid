# consistent-area-naming

Require consistent naming for `grid-template-areas` and single-name `grid-area`
identifiers.

The default style is `kebab-case`. Secondary option `style` also accepts
`camel-case` and `snake-case`.

## Incorrect

```css
.layout {
  grid-template-areas: "mainContent";
}
```

## Correct

```css
.layout {
  grid-template-areas: "main-content";
}
```

## Options

```js
export default {
  rules: {
    "grid/consistent-area-naming": [true, { style: "snake-case" }]
  }
};
```

## Related Rules

- [`no-invalid-areas`](./no-invalid-areas.md) enforces valid area tokens before
  naming-style policy applies.
- [`no-unused-areas`](./no-unused-areas.md) and
  [`no-unknown-areas`](./no-unknown-areas.md) use the same named-area vocabulary.
- [`grid-all`](./configs/grid-all.md) enables this stricter policy rule.
