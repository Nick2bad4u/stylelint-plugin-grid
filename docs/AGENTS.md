---
name: "Codex-Instructions-Stylelint-Docs"
description: "Instructions for writing high-quality Stylelint rule and config documentation."
applyTo: "docs/**"
---

<instructions>
  <goal>

## Your Goal for Stylelint Rule Documentation

- Your goal is to make every Stylelint rule documentation file (commonly `docs/rules/<rule-id>.md`) totally self-contained, allowing a developer to understand *why* the rule exists, *what* it flags, and *how* to fix it without looking at the source code.
- For adjacent rule-docs pages such as guides, config pages, `overview.md`, or `getting-started.md`, keep the same tone and accuracy standards, but do not force rule-only sections where they do not fit.
- You adhere strictly to Stylelint's documentation conventions and modern CSS tooling expectations.

## Documentation Quality Bar

- Every rule doc should be **hand-written, specific, and high quality**.
- Do **not** use a script or helper to stamp the same shallow prose into every rule doc.
- Do **not** rely on runtime metadata injection to make docs look complete.
- Shared guides, shared tables, or synced indexes are fine, but the actual rule page content must still be authored intentionally for that rule.
- If two rules need different rationale, caveats, migration notes, or examples, the docs must say so explicitly instead of collapsing into boilerplate.

## Static docs over generated filler

- Rule docs should not depend on runtime helpers to inject core explanatory content.
- Metadata can help validate, link, or classify docs, but it should not replace authoring.
- Write the description, rationale, examples, options explanation, edge cases, and "when not to use it" section manually.

  </goal>

  <structure>

## Documentation Structure

Rule documentation files in the repository's rule-docs location (commonly `docs/rules/<rule-id>.md`) should follow this structure closely:

1. **Title:** The bare rule ID as the H1 header (for example `# validate-area-shapes`).
2. **Description:** A short, one-sentence description of what the rule does.
3. **Meta Badges (Optional):** Badges for `Recommended`, `Fixable`, or syntax requirements only if the repository’s current docs pattern uses them.
4. **Rule Details:** An explanation of the problem the rule solves. Why is this pattern bad?
5. **Examples:**
   - Use `❌ Incorrect` and `✅ Correct` headers.
   - Always include code blocks with specific comments explaining *why* a line is incorrect when the reason is not obvious.
   - If the rule is configurable, show examples for different configurations.
6. **Options (if applicable):**
   - A TypeScript type or JSON-like shape definition of the options object.
   - Default values clearly marked.
   - Examples for each option.
7. **When Not To Use It:** specific scenarios where disabling this rule is acceptable.
8. **Further Reading:** Links to Stylelint docs, MDN, CSS specs, or relevant framework docs.

  </structure>

  <style>

## Style & Tone

- **Voice:** Professional, objective, and helpful. Avoid slang.
- **Clarity:** Use active voice. "This rule reports..." instead of "This rule is used to report...".
- **Code Blocks:**
  - Use the most accurate language tag (`css`, `scss`, `mdx`, `html`, `tsx`) for the example.
  - Use `/* stylelint-disable-next-line ... */` comments only when necessary to clarify context.
- **Configuration:**
  - Prefer ESM `stylelint.config.mjs` examples.
  - If the package exports shareable configs, show those first.

  </style>

  <guidelines>

## Writing Guidelines

- **The "Why":** Never just say "Don't do X." Explain the consequence.
- **The "Fix":** If the rule is fixable, explicitly state what the auto-fixer does.
- **Syntax Requirements:** If the rule depends on a particular syntax or `customSyntax`, add a note at the top of the docs explaining that requirement.
- **Config awareness:** If the repository already exposes shareable configs that enable the rule, mention that clearly.
- **Consistency:** Ensure the examples actually trigger the rule. Do not use hypothetical examples that strictly wouldn't fail the implementation.
- **No copy-paste filler:** Avoid reusing the same generic paragraph across many rule docs unless it is truly shared guidance that belongs in a separate guide page.
- **No fake completeness:** A shorter but precise doc is better than a long page padded with repetitive or template-only text.
- **Manual curation:** If the repo has scripts that sync rule tables, sidebars, config matrices, or indexes, use those only for derived navigation/data. They are not a substitute for authoring the page itself.

  </guidelines>

  <examples>

## Example Doc

```markdown
# validate-area-shapes

Require every named grid template area to form one contiguous rectangle.

This rule catches invalid grid area maps before the browser drops the template.

## Targeted pattern scope

This rule focuses on `grid-template-areas` declarations that use the same named area in a shape that is not rectangular.

- `"main side" "main main"` is invalid because the `main` area forms an L shape.

Malformed templates should be handled by `grid/no-invalid-areas` first so shape-specific reporting stays accurate.

## What this rule reports

This rule reports each named grid area that does not fill its bounding rectangle.

## Why this rule exists

CSS Grid named areas must be rectangular. Non-rectangular templates do not mean "creative spanning"; they are invalid CSS Grid templates.

- Browsers ignore invalid area maps.
- Layout bugs can hide behind otherwise valid declarations.
- The failure is easier to diagnose at the authored template string than after rendering.

## ❌ Incorrect

```css
.my-component {
  grid-template-areas:
    "main side"
    "main main";
}
```

## ✅ Correct

```css
.my-component {
  grid-template-areas:
    "main side"
    "main side";
}
```

## Stylelint config example

```js
import { gridPluginConfigs } from "stylelint-plugin-grid";

export default gridPluginConfigs["grid-recommended"];
```

> Replace `validate-area-shapes` with the actual rule ID used in the target documentation page.

## When not to use it

Disable this rule only if your stylesheet intentionally contains browser-specific fallback templates that another build step rewrites before shipping.

## Further reading

- [Stylelint plugin guide](https://stylelint.io/developer-guide/plugins)
- [MDN: Grid template areas](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-areas)
- [CSS Grid Layout Module](https://drafts.csswg.org/css-grid/)

  </examples>
</instructions>
