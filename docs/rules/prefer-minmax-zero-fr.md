# prefer-minmax-zero-fr

Prefer `minmax(0, <flex>)` for bare flexible CSS Grid column tracks.

Bare `fr` column tracks use an automatic minimum size, so long content can
force columns wider than intended. Wrapping the flexible track in `minmax(0, …)`
keeps the column flexible while allowing content to shrink or overflow according
to the rest of the layout rules.

## Incorrect

```css
.layout {
  grid-template-columns: 1fr 2fr;
}
```

## Correct

```css
.layout {
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
}
```

```css
.layout {
  grid-template-columns: repeat(2, 1fr);
}
```

## Stylelint Config

```js
export default {
  plugins: ["stylelint-plugin-grid"],
  rules: {
    "grid/prefer-minmax-zero-fr": true
  }
};
```

## Related Rules

- [`no-invalid-minmax`](./no-invalid-minmax.md) rejects flexible minimums inside
  `minmax()`.
- [`no-invalid-auto-repeat`](./no-invalid-auto-repeat.md) checks auto-repeat
  track sizes.
- [`grid-all`](./configs/grid-all.md) enables this optional rule.
