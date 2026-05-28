import sharedConfig from "stylelint-config-nick2bad4u";

const sharedExtends = sharedConfig.extends;
const sharedExtendsList = Array.isArray(sharedExtends)
    ? sharedExtends
    : sharedExtends === undefined
      ? []
      : [sharedExtends];

/**
 * @param {import("stylelint").Config["rules"] | undefined} rules
 */
const withoutDocusaurusRules = (rules) =>
    Object.fromEntries(
        Object.entries(rules ?? {}).filter(
            ([ruleName]) => !ruleName.startsWith("docusaurus/")
        )
    );

/** @type {import("stylelint").Config} */
const stylelintConfig = {
    ...sharedConfig,
    extends: sharedExtendsList.filter(
        (entry) =>
            entry !== "stylelint-plugin-docusaurus/configs/docusaurus-all"
    ),
    overrides: [
        ...(sharedConfig.overrides ?? []).map((override) => ({
            ...override,
            rules: withoutDocusaurusRules(override.rules),
        })),
        {
            files: ["docs/docusaurus/src/**/*.css"],
            rules: {
                "css-performance-budget/no-excessive-filter-effects": null,
                "css-performance-budget/no-expensive-animation-properties":
                    null,
                "css-performance-budget/no-giant-selector-lists": null,
                "css-performance-budget/no-heavy-selectors": null,
                "css-performance-budget/no-layout-thrashing-properties": null,
                "css-performance-budget/no-paint-heavy-declarations": null,
            },
        },
    ],
    rules: withoutDocusaurusRules(sharedConfig.rules),
};

export default stylelintConfig;
