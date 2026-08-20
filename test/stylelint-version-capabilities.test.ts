import { describe, expect, it } from "vitest";

import { supportsReportFixCallback } from "../src/_internal/stylelint-version-capabilities.js";

describe("stylelint runtime capabilities", () => {
    it("recognizes the report fix callback version boundary", () => {
        expect.hasAssertions();

        expect(supportsReportFixCallback("16.0.0")).toBe(false);
        expect(supportsReportFixCallback("16.6.1")).toBe(false);
        expect(supportsReportFixCallback("16.7.0")).toBe(true);
        expect(supportsReportFixCallback("16.26.1")).toBe(true);
        expect(supportsReportFixCallback("17.14.1")).toBe(true);
        expect(supportsReportFixCallback("18.0.0-beta.1")).toBe(true);
        expect(supportsReportFixCallback("future")).toBe(true);
    });
});
