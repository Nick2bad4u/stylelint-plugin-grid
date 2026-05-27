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
