# no-unknown-areas

Disallow single-name `grid-area` references that do not match any named area
declared by `grid-template-areas` in the same stylesheet.

## Incorrect

```css
.layout {
  grid-template-areas: "header main";
}

.sidebar {
  grid-area: sidebr;
}
```

## Correct

```css
.layout {
  grid-template-areas: "header main";
}

.header {
  grid-area: header;
}
```

The rule only checks single-name `grid-area` declarations. Line-based shorthand
placements are ignored.

## Related Rules

- [`no-unused-areas`](./no-unused-areas.md) checks the inverse problem: declared
  template areas without matching item assignments.
- [`no-overlapping-areas`](./no-overlapping-areas.md) reports duplicate
  single-name assignments in the same stylesheet.
- [Current status](./guides/current-status.md) explains the same-file assumptions.
