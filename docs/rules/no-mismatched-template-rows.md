# no-mismatched-template-rows

Require `grid-template-rows` track count to match `grid-template-areas` row
count when both declarations appear in the same block.

## Incorrect

```css
.layout {
  grid-template-areas:
    "header"
    "main";
  grid-template-rows: auto;
}
```

## Correct

```css
.layout {
  grid-template-areas:
    "header"
    "main";
  grid-template-rows: auto 1fr;
}
```

Dynamic track lists such as `repeat(auto-fit, ...)` are skipped because their
count cannot be known statically.

## Related Rules

- [`validate-track-counts`](./validate-track-counts.md) also checks column-count
  drift.
- [`no-invalid-areas`](./no-invalid-areas.md) validates the parsed template rows.
- [`grid-recommended`](./configs/grid-recommended.md) enables this rule by default.
