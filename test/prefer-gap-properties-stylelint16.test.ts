import { describe, expect, it, vi } from "vitest";

import { runStylelintWithConfig } from "./_internal/stylelint-test-helpers.js";

vi.mock(import("../src/_internal/stylelint-version-capabilities.js"), () => ({
    supportsInstalledStylelintReportFixCallback: false,
}));

describe("prefer-gap-properties legacy Stylelint fixer", () => {
    it("uses direct mutation when the report fix callback is unavailable", async () => {
        expect.hasAssertions();

        const source = ".layout { grid-gap: 1rem; }";
        const expected = ".layout { gap: 1rem; }";
        const emitWarning = vi
            .spyOn(process, "emitWarning")
            .mockReturnValue(undefined);
        let result: Awaited<ReturnType<typeof runStylelintWithConfig>>;

        try {
            result = await runStylelintWithConfig({
                code: source,
                config: { rules: { "grid/prefer-gap-properties": true } },
                fix: true,
            });
        } finally {
            emitWarning.mockRestore();
        }

        expect(result.code).toBe(expected);
        expect(result.code).not.toBe(source);
        expect(result.results[0]?.invalidOptionWarnings).toHaveLength(0);
        expect(result.results[0]?.parseErrors).toHaveLength(0);
        expect(result.results[0]?.warnings).toHaveLength(0);
    });
});
