# no-unused-areas

Disallow named template areas that are never referenced by a single-name
`grid-area` declaration in the same stylesheet.

This rule is intentionally not recommended by default. It is useful when grid
containers and grid items are authored together, but it can be noisy when
templates and items live in separate files.

## Incorrect

```css
.layout {
  grid-template-areas: "header main";
}

.main {
  grid-area: main;
}
```

## Related Rules

- [`no-unknown-areas`](./no-unknown-areas.md) catches item assignments that do not
  exist in any same-stylesheet template.
- [`no-overlapping-areas`](./no-overlapping-areas.md) catches duplicate
  single-name assignments.
- [`grid-all`](./configs/grid-all.md) enables this stricter same-stylesheet rule.

## Correct

```css
.layout {
  grid-template-areas: "header main";
}

.header {
  grid-area: header;
}

.main {
  grid-area: main;
}
```
