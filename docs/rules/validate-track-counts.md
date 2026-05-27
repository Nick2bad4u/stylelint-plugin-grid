# validate-track-counts

Require sibling `grid-template-rows` and `grid-template-columns` declarations to
match the dimensions of `grid-template-areas`.

## Incorrect

```css
.layout {
  grid-template-areas:
    "nav main"
    "nav footer";
  grid-template-columns: 12rem;
  grid-template-rows: auto auto auto;
}
```

## Correct

```css
.layout {
  grid-template-areas:
    "nav main"
    "nav footer";
  grid-template-columns: 12rem 1fr;
  grid-template-rows: auto auto;
}
```

The rule understands explicit tracks and integer `repeat(...)` notation. It
skips dynamic repeat counts.

## Related Rules

- [`no-invalid-areas`](./no-invalid-areas.md) validates the template rows this rule
  measures.
- [`no-mismatched-template-rows`](./no-mismatched-template-rows.md) is the narrower
  row-only check.
- [`grid-recommended`](./configs/grid-recommended.md) enables this rule by default.
