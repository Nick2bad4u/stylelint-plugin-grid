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
    overrides: (sharedConfig.overrides ?? []).map((override) => ({
        ...override,
        rules: withoutDocusaurusRules(override.rules),
    })),
    rules: withoutDocusaurusRules(sharedConfig.rules),
};

export default stylelintConfig;
