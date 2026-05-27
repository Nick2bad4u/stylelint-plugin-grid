import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

import plugins, {
    configNames,
    gridPluginConfigs,
    meta,
    ruleIds,
    ruleNames,
    rules,
} from "../src/plugin";
import { lintWithConfig } from "./_internal/stylelint-test-helpers";

const require = createRequire(import.meta.url);
type BuiltCjsPluginModule = Readonly<{
    gridPluginConfigs: typeof gridPluginConfigs;
    meta: typeof meta;
    ruleIds: typeof ruleIds;
    ruleNames: typeof ruleNames;
    rules: typeof rules;
}> &
    typeof plugins;

const getConfigPluginRuleNames = (
    config: (typeof gridPluginConfigs)[keyof typeof gridPluginConfigs]
): readonly string[] =>
    config.plugins.map((plugin) => {
        if (typeof plugin === "string") {
            return plugin;
        }

        return "ruleName" in plugin
            ? plugin.ruleName
            : (plugin.default?.ruleName ?? "");
    });

describe("stylelint-plugin-grid runtime", () => {
    it("exports stable package metadata", () => {
        expect.hasAssertions();

        expect(meta.name).toBe("stylelint-plugin-grid");
        expect(meta.namespace).toBe("grid");
        expect(meta.version).toMatch(/^\d+\.\d+\.\d+/v);
    });

    it("keeps rule registry exports internally consistent", () => {
        expect.hasAssertions();

        expect(ruleNames).toHaveLength(ruleIds.length);
        expect(Object.keys(rules)).toStrictEqual([...ruleNames]);

        for (const ruleId of ruleIds) {
            expect(ruleId.startsWith("grid/")).toBe(true);
        }
    });

    it("preserves named exports on the built CommonJS entrypoint", () => {
        expect.hasAssertions();

        const builtCjsPlugin =
            require("../dist/plugin.cjs") as BuiltCjsPluginModule;

        expect(Array.isArray(builtCjsPlugin)).toBe(true);
        expect(Object.keys(builtCjsPlugin.gridPluginConfigs)).toStrictEqual([
            ...configNames,
        ]);
        expect(
            builtCjsPlugin.gridPluginConfigs["grid-all"].rules
        ).toStrictEqual(gridPluginConfigs["grid-all"].rules);
        expect(
            builtCjsPlugin.gridPluginConfigs["grid-recommended"].rules
        ).toStrictEqual(gridPluginConfigs["grid-recommended"].rules);
        expect(
            getConfigPluginRuleNames(
                builtCjsPlugin.gridPluginConfigs["grid-all"]
            )
        ).toStrictEqual(
            getConfigPluginRuleNames(gridPluginConfigs["grid-all"])
        );
        expect(
            getConfigPluginRuleNames(
                builtCjsPlugin.gridPluginConfigs["grid-recommended"]
            )
        ).toStrictEqual(
            getConfigPluginRuleNames(gridPluginConfigs["grid-recommended"])
        );
        expect(builtCjsPlugin.meta).toStrictEqual(meta);
        expect(builtCjsPlugin.ruleIds).toStrictEqual(ruleIds);
        expect(builtCjsPlugin.ruleNames).toStrictEqual(ruleNames);
        expect(Object.keys(builtCjsPlugin.rules)).toStrictEqual(
            Object.keys(rules)
        );
    });

    it("exposes the expected shareable config names and rule ids", () => {
        expect.hasAssertions();

        expect(configNames).toStrictEqual(["grid-all", "grid-recommended"]);
        expect(Object.keys(gridPluginConfigs)).toStrictEqual([
            "grid-all",
            "grid-recommended",
        ]);
        expect(ruleNames).toStrictEqual([
            "consistent-area-naming",
            "no-invalid-areas",
            "no-mismatched-template-rows",
            "no-overlapping-areas",
            "no-unknown-areas",
            "no-unused-areas",
            "prefer-gap-properties",
            "validate-area-shapes",
            "validate-track-counts",
        ]);
    });

    it("lets the recommended config lint baseline CSS without warnings", async () => {
        expect.hasAssertions();

        const recommendedConfig = gridPluginConfigs["grid-recommended"];
        const result = await lintWithConfig({
            code: `
                .layout {
                    display: grid;
                    gap: 1rem;
                    grid-template-areas:
                        "header header"
                        "nav main";
                    grid-template-columns: 12rem 1fr;
                    grid-template-rows: auto minmax(0, 1fr);
                }

                .header { grid-area: header; }
                .nav { grid-area: nav; }
                .main { grid-area: main; }
            `,
            config: recommendedConfig,
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("keeps `recommended` and `all` aligned with the public rule catalog", () => {
        expect.hasAssertions();

        expect(gridPluginConfigs["grid-recommended"].plugins).toStrictEqual([
            ...plugins,
        ]);
        expect(gridPluginConfigs["grid-all"].plugins).toStrictEqual([
            ...plugins,
        ]);
        expect(gridPluginConfigs["grid-recommended"].rules).toStrictEqual({
            "grid/no-invalid-areas": true,
            "grid/no-mismatched-template-rows": true,
            "grid/no-unknown-areas": true,
            "grid/prefer-gap-properties": true,
            "grid/validate-area-shapes": true,
            "grid/validate-track-counts": true,
        });
        expect(gridPluginConfigs["grid-all"].rules).toStrictEqual({
            "grid/consistent-area-naming": true,
            "grid/no-invalid-areas": true,
            "grid/no-mismatched-template-rows": true,
            "grid/no-overlapping-areas": true,
            "grid/no-unknown-areas": true,
            "grid/no-unused-areas": true,
            "grid/prefer-gap-properties": true,
            "grid/validate-area-shapes": true,
            "grid/validate-track-counts": true,
        });
    });
});
