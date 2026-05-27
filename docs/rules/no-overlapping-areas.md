# no-overlapping-areas

Disallow multiple selectors assigning the same single-name `grid-area` value in
one stylesheet.

This rule is not recommended by default because some projects intentionally
stack multiple items in the same area. Use it when duplicate area assignments
usually indicate layout collisions in your codebase.

## Incorrect

```css
.header {
  grid-area: header;
}

.mobileHeader {
  grid-area: header;
}
```

## Correct

```css
.header {
  grid-area: header;
}

.sidebar {
  grid-area: sidebar;
}
```

## Related Rules

- [`no-unused-areas`](./no-unused-areas.md) verifies that declared template areas
  are actually assigned.
- [`no-unknown-areas`](./no-unknown-areas.md) verifies that assigned area names
  exist in a template.
- [`grid-all`](./configs/grid-all.md) enables this stricter same-stylesheet rule.
