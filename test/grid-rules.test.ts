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
