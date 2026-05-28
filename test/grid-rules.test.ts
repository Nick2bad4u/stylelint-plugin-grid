import { describe, expect, it } from "vitest";

import {
    getWarningTexts,
    lintWithConfig,
    runStylelintWithConfig,
} from "./_internal/stylelint-test-helpers";

describe("grid rule behavior", () => {
    it("accepts a valid minimal named-area grid", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .layout {
                    display: grid;
                    grid-template-areas: "header main";
                    grid-template-columns: auto 1fr;
                }

                .header { grid-area: header; }
                .main { grid-area: main; }
            `,
            config: {
                rules: {
                    "grid/no-invalid-areas": true,
                    "grid/no-unknown-areas": true,
                    "grid/validate-track-counts": true,
                },
            },
        });

        expect(result.warnings).toHaveLength(0);
        expect(getWarningTexts(result)).not.toContain(
            "Grid template row 1 has"
        );
    });

    it("reports malformed grid-template-areas rows", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .layout {
                    grid-template-areas:
                        "header header"
                        "nav";
                }
            `,
            config: { rules: { "grid/no-invalid-areas": true } },
        });

        expect(getWarningTexts(result)).toContain(
            "Grid template row 2 has 1 columns, but row 1 has 2. (grid/no-invalid-areas)"
        );
    });

    it("reports definitely invalid auto-repeat track sizes", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .cards {
                    grid-template-columns: repeat(auto-fit, 1fr);
                    grid-template-rows: repeat(auto-fill, minmax(auto, 1fr));
                }
            `,
            config: { rules: { "grid/no-invalid-auto-repeat": true } },
        });

        expect(result.warnings).toHaveLength(2);
        expect(getWarningTexts(result)).toContain(
            "Use a fixed track size inside `repeat(auto-fit, ...)`; `1fr` can make the grid template declaration invalid. (grid/no-invalid-auto-repeat)"
        );
        expect(getWarningTexts(result)).toContain(
            "Use a fixed track size inside `repeat(auto-fill, ...)`; `minmax(auto, 1fr)` can make the grid template declaration invalid. (grid/no-invalid-auto-repeat)"
        );
    });

    it("accepts fixed auto-repeat track sizes", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .cards {
                    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
                    grid-template-rows: repeat(auto-fill, [card] minmax(0, 1fr));
                    grid-template-columns: repeat(auto-fit, minmax(auto, 10rem));
                }
            `,
            config: { rules: { "grid/no-invalid-auto-repeat": true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("reports flexible minimums in minmax track sizes", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .layout {
                    grid-template-columns: minmax(1fr, 20rem) 2fr;
                    grid-auto-rows: minmax(0.5fr, auto);
                }
            `,
            config: { rules: { "grid/no-invalid-minmax": true } },
        });

        expect(result.warnings).toHaveLength(2);
        expect(getWarningTexts(result)).toContain(
            "Do not use flexible track breadth `1fr` as the minimum in `minmax()`; use an inflexible minimum such as `0`, a length, or a percentage. (grid/no-invalid-minmax)"
        );
        expect(getWarningTexts(result)).toContain(
            "Do not use flexible track breadth `0.5fr` as the minimum in `minmax()`; use an inflexible minimum such as `0`, a length, or a percentage. (grid/no-invalid-minmax)"
        );
    });

    it("accepts inflexible minimums in minmax track sizes", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .layout {
                    grid-template-columns: minmax(0, 1fr) minmax(12rem, 20rem);
                    grid-auto-rows: minmax(25%, auto);
                }
            `,
            config: { rules: { "grid/no-invalid-minmax": true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("reports invalid fixed repeat counts", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .layout {
                    grid-template-columns: repeat(0, 1fr);
                    grid-template-rows: repeat(2.5, auto);
                    grid-template-columns: repeat(-2, minmax(0, 1fr));
                }
            `,
            config: { rules: { "grid/no-invalid-repeat-count": true } },
        });

        expect(result.warnings).toHaveLength(3);
        expect(getWarningTexts(result)).toContain(
            "Use a positive integer repeat count; `0` is not a valid fixed `repeat()` count. (grid/no-invalid-repeat-count)"
        );
        expect(getWarningTexts(result)).toContain(
            "Use a positive integer repeat count; `2.5` is not a valid fixed `repeat()` count. (grid/no-invalid-repeat-count)"
        );
        expect(getWarningTexts(result)).toContain(
            "Use a positive integer repeat count; `-2` is not a valid fixed `repeat()` count. (grid/no-invalid-repeat-count)"
        );
    });

    it("accepts valid repeat counts and dynamic repeat counts", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .layout {
                    grid-template-columns: repeat(12, minmax(0, 1fr));
                    grid-template-rows: repeat(+2, auto);
                    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
                    grid-template-rows: repeat(var(--rows), auto);
                }
            `,
            config: { rules: { "grid/no-invalid-repeat-count": true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("reports non-positive grid span counts", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .item {
                    grid-column: span 0 / span 2;
                    grid-row-start: span -1;
                    grid-area: 1 / span -2 / 3 / 4;
                }
            `,
            config: { rules: { "grid/no-invalid-span": true } },
        });

        expect(result.warnings).toHaveLength(3);
        expect(getWarningTexts(result)).toContain(
            "Use a positive Grid span count; `span 0` cannot place a grid item. (grid/no-invalid-span)"
        );
        expect(getWarningTexts(result)).toContain(
            "Use a positive Grid span count; `span -1` cannot place a grid item. (grid/no-invalid-span)"
        );
        expect(getWarningTexts(result)).toContain(
            "Use a positive Grid span count; `span -2` cannot place a grid item. (grid/no-invalid-span)"
        );
    });

    it("accepts positive and dynamic grid span counts", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .item {
                    grid-column: span 2 / sidebar-end;
                    grid-row-start: span var(--rows);
                    grid-area: header;
                }
            `,
            config: { rules: { "grid/no-invalid-span": true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("reports grid placement line zero", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .item {
                    grid-column: 0 / 2;
                    grid-row-end: 0;
                }
            `,
            config: { rules: { "grid/no-zero-grid-lines": true } },
        });

        expect(result.warnings).toHaveLength(2);
        expect(getWarningTexts(result)).toContain(
            "Do not use Grid line `0`; CSS Grid line numbering starts at `1` and `-1`. (grid/no-zero-grid-lines)"
        );
    });

    it("accepts nonzero grid placement lines and dynamic values", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .item {
                    grid-column: 1 / -1;
                    grid-row: var(--row-start) / var(--row-end);
                    grid-area: main;
                }
            `,
            config: { rules: { "grid/no-zero-grid-lines": true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("reports reversed or zero-width numeric grid placement ranges", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .item {
                    grid-column: 4 / 2;
                    grid-row: 3 / 3;
                    grid-area: 5 / 2 / 4 / 4;
                }

                .other {
                    grid-column-start: 7;
                    grid-column-end: 6;
                }
            `,
            config: {
                rules: { "grid/no-reversed-placement-lines": true },
            },
        });

        expect(result.warnings).toHaveLength(4);
        expect(getWarningTexts(result)).toContain(
            "Use an end line after the start line for `grid-column`; `2` is not after `4`. (grid/no-reversed-placement-lines)"
        );
        expect(getWarningTexts(result)).toContain(
            "Use an end line after the start line for `grid-row`; `3` is not after `3`. (grid/no-reversed-placement-lines)"
        );
    });

    it("accepts ordered, named, span, and dynamic grid placement ranges", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .item {
                    grid-column: 2 / 4;
                    grid-row: span 2 / 5;
                    grid-area: 1 / content-start / 3 / content-end;
                }

                .other {
                    grid-column-start: var(--start);
                    grid-column-end: var(--end);
                }
            `,
            config: {
                rules: { "grid/no-reversed-placement-lines": true },
            },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("reports grid container properties made ineffective by display", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .layout {
                    display: contents;
                    grid-template-columns: 1fr 1fr;
                    grid-auto-flow: column;
                }

                .cards {
                    display: grid;
                    display: flex;
                    grid-template-areas: "card card";
                }
            `,
            config: {
                rules: { "grid/no-ineffective-container-properties": true },
            },
        });

        expect(result.warnings).toHaveLength(3);
        expect(getWarningTexts(result)).toContain(
            "`grid-template-columns` has no grid-container effect when the final same-block `display` value is `contents`; use `grid` or `inline-grid`, or remove the grid container declaration. (grid/no-ineffective-container-properties)"
        );
    });

    it("accepts grid container properties with grid-capable or unknown display", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .layout {
                    display: block;
                    display: grid;
                    grid-template-columns: minmax(0, 1fr);
                }

                .dynamic {
                    display: var(--layout-display);
                    grid-template-areas: "main";
                }
            `,
            config: {
                rules: { "grid/no-ineffective-container-properties": true },
            },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("reports same-block conflicting grid placement declarations", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .item {
                    grid-area: sidebar;
                    grid-column: 2 / 4;
                    grid-row-start: 1;
                }

                .other {
                    grid-column: 1 / 3;
                    grid-column-start: 2;
                }
            `,
            config: { rules: { "grid/no-conflicting-placement": true } },
        });

        expect(result.warnings).toHaveLength(3);
        expect(getWarningTexts(result)).toContain(
            "Avoid conflicting Grid placement declarations; `grid-column` writes the same placement slot as earlier `grid-area` in this block. (grid/no-conflicting-placement)"
        );
    });

    it("accepts non-overlapping grid placement declarations", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .item {
                    grid-row: 1 / 3;
                    grid-column: 2 / 4;
                }
            `,
            config: { rules: { "grid/no-conflicting-placement": true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("reports named area templates without required explicit tracks", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .layout {
                    grid-template-areas: "nav main";
                }

                .strict {
                    grid-template-areas: "main";
                    grid-template-columns: minmax(0, 1fr);
                }
            `,
            config: {
                rules: {
                    "grid/require-explicit-tracks-with-areas": [
                        true,
                        { rows: true },
                    ],
                },
            },
        });

        expect(result.warnings).toHaveLength(3);
        expect(getWarningTexts(result)).toContain(
            "Pair `grid-template-areas` with `grid-template-columns` in the same block so named areas have explicit track sizing. (grid/require-explicit-tracks-with-areas)"
        );
        expect(getWarningTexts(result)).toContain(
            "Pair `grid-template-areas` with `grid-template-rows` in the same block so named areas have explicit track sizing. (grid/require-explicit-tracks-with-areas)"
        );
    });

    it("accepts named area templates with configured explicit tracks", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .layout {
                    grid-template-areas: "nav main";
                    grid-template-columns: auto minmax(0, 1fr);
                }
            `,
            config: {
                rules: { "grid/require-explicit-tracks-with-areas": true },
            },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("reports bare flexible grid column tracks", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .layout {
                    grid-template-columns: 1fr minmax(0, 2fr) +3fr;
                }
            `,
            config: { rules: { "grid/prefer-minmax-zero-fr": true } },
        });

        expect(result.warnings).toHaveLength(2);
        expect(getWarningTexts(result)).toContain(
            "Wrap bare flexible column track `1fr` in `minmax(0, 1fr)` to avoid content-driven overflow. (grid/prefer-minmax-zero-fr)"
        );
        expect(getWarningTexts(result)).toContain(
            "Wrap bare flexible column track `+3fr` in `minmax(0, +3fr)` to avoid content-driven overflow. (grid/prefer-minmax-zero-fr)"
        );
    });

    it("accepts minmax-wrapped, repeated, and row flexible tracks", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .layout {
                    grid-template-columns: minmax(0, 1fr) repeat(2, 1fr);
                    grid-template-rows: 1fr;
                }
            `,
            config: { rules: { "grid/prefer-minmax-zero-fr": true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("reports dense grid auto-flow", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .cards {
                    grid-auto-flow: column dense;
                }
            `,
            config: { rules: { "grid/no-dense-auto-flow": true } },
        });

        expect(result.warnings).toHaveLength(1);
        expect(getWarningTexts(result)).toContain(
            "Avoid `grid-auto-flow: dense`; dense packing can disconnect visual order from source order. (grid/no-dense-auto-flow)"
        );
    });

    it("accepts sparse grid auto-flow", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .cards {
                    grid-auto-flow: column;
                }
            `,
            config: { rules: { "grid/no-dense-auto-flow": true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("reports column auto-flow without explicit row sizing", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .cards {
                    grid-auto-flow: column;
                    grid-template-columns: repeat(3, 1fr);
                }
            `,
            config: {
                rules: {
                    "grid/require-explicit-rows-with-column-flow": true,
                },
            },
        });

        expect(result.warnings).toHaveLength(1);
        expect(getWarningTexts(result)).toContain(
            "Pair `grid-auto-flow: column` with explicit row sizing in the same block, such as `grid-template-rows` or `grid-auto-rows`. (grid/require-explicit-rows-with-column-flow)"
        );
    });

    it("accepts column auto-flow with explicit row sizing", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .cards {
                    grid-auto-flow: column;
                    grid-auto-rows: minmax(10rem, auto);
                }
            `,
            config: {
                rules: {
                    "grid/require-explicit-rows-with-column-flow": true,
                },
            },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("reports non-rectangular named areas", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .layout {
                    grid-template-areas:
                        "main side"
                        "main main";
                }
            `,
            config: { rules: { "grid/validate-area-shapes": true } },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("main");
    });

    it("reports mismatched template rows", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .layout {
                    grid-template-areas:
                        "header"
                        "main";
                    grid-template-rows: auto;
                }
            `,
            config: { rules: { "grid/no-mismatched-template-rows": true } },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("defines 2 rows");
    });

    it("reports mismatched column tracks", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .layout {
                    grid-template-areas: "nav main";
                    grid-template-columns: 12rem;
                }
            `,
            config: { rules: { "grid/validate-track-counts": true } },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("defines 2 columns");
    });

    it("reports unknown grid-area names", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .layout { grid-template-areas: "header main"; }
                .typo { grid-area: mian; }
            `,
            config: { rules: { "grid/no-unknown-areas": true } },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("mian");
    });

    it("reports unused template areas", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .layout { grid-template-areas: "header main"; }
                .main { grid-area: main; }
            `,
            config: { rules: { "grid/no-unused-areas": true } },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("header");
    });

    it("reports duplicate area assignments as potential overlaps", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .header { grid-area: header; }
                .mobileHeader { grid-area: header; }
            `,
            config: { rules: { "grid/no-overlapping-areas": true } },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("more than one selector");
    });

    it("reports area names that do not match the configured style", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .layout { grid-template-areas: "mainContent"; }
                .main { grid-area: mainContent; }
            `,
            config: { rules: { "grid/consistent-area-naming": true } },
        });

        expect(result.warnings).toHaveLength(2);
    });

    it("autofixes legacy grid gap aliases", async () => {
        expect.hasAssertions();

        const result = await runStylelintWithConfig({
            code: `
                .layout {
                    grid-gap: 1rem;
                    grid-column-gap: 2rem;
                    grid-row-gap: 3rem;
                }
            `,
            config: { rules: { "grid/prefer-gap-properties": true } },
            fix: true,
        });

        expect(result.code).toContain("gap: 1rem");
        expect(result.code).toContain("column-gap: 2rem");
        expect(result.code).toContain("row-gap: 3rem");
    });
});
