/**
 * @packageDocumentation
 * Public plugin entrypoint for `stylelint-plugin-grid` exports and
 * shareable config wiring.
 */
import type { Config, Plugin as StylelintPlugin } from "stylelint";

import { isDefined, objectKeys } from "ts-extras";

import type { StylelintPluginRuleContract } from "./_internal/create-stylelint-rule.js";

import {
    CONFIG_NAMES as configNamesValue,
    type GridConfigName as InternalGridConfigName,
    PACKAGE_NAME as packageNameValue,
    PACKAGE_VERSION as packageVersionValue,
    PLUGIN_NAMESPACE as pluginNamespaceValue,
} from "./_internal/plugin-constants.js";
import { gridRules as gridRulesValue } from "./_internal/rules-registry.js";

/** Public shareable config map exported by this package. */
export type GridConfigMap = Record<GridConfigName, GridShareableConfig>;
/** Shareable config names exposed by this package. */
export type GridConfigName = InternalGridConfigName;
/** Public fully-qualified rule ids supported by this package. */
export type GridRuleId = `${typeof pluginNamespaceValue}/${string}`;

/** Public unqualified rule names supported by this package. */
export type GridRuleName = Extract<keyof typeof gridRulesValue, string>;

/** Shareable config shape exported by this package. */
export type GridShareableConfig = Config & {
    plugins: (string | StylelintPlugin)[];
    rules: NonNullable<Config["rules"]>;
};

/** Internal ordered registry entry tuple. */
type GridRuleEntry = readonly [string, StylelintPluginRuleContract];
/** Internal runtime rule registry shape. */
type GridRulesMap = Readonly<Record<string, StylelintPluginRuleContract>>;

/** Local package metadata values used to avoid import re-export warnings. */
const packageMetaName = packageNameValue;
const packageMetaNamespace = pluginNamespaceValue;
const packageMetaVersion = packageVersionValue;
/** Local rule registry alias used to avoid import re-export warnings. */
const runtimeRules = gridRulesValue;
/** Local config-name alias used to avoid import re-export warnings. */
const publicConfigNames = configNamesValue;

/** Public package metadata exported alongside the plugin pack. */
export const meta: Readonly<{
    name: string;
    namespace: string;
    version: string;
}> = {
    name: packageMetaName,
    namespace: packageMetaNamespace,
    version: packageMetaVersion,
};

/** Public rule registry keyed by unqualified rule name. */
export const rules: GridRulesMap = runtimeRules;

/** Stable ordered unqualified rule names. */
export const ruleNames: readonly string[] = objectKeys(rules).toSorted(
    (left, right) => left.localeCompare(right)
);

/** Stable ordered registry entries used to derive configs and ids. */
const gridRuleEntries: readonly GridRuleEntry[] = (() => {
    const entries: GridRuleEntry[] = [];

    for (const ruleName of ruleNames) {
        const rule = rules[ruleName];

        if (isDefined(rule)) {
            entries.push([ruleName, rule]);
        }
    }

    return entries;
})();

function isGridRuleId(ruleName: string): ruleName is GridRuleId {
    return ruleName.startsWith(`${pluginNamespaceValue}/`);
}

function toGridRuleId(ruleName: string): GridRuleId {
    if (!isGridRuleId(ruleName)) {
        throw new Error(`Unexpected Stylelint rule id "${ruleName}".`);
    }

    return ruleName;
}

/** Default plugin-pack export consumed by Stylelint. */
export const plugins: readonly StylelintPlugin[] = gridRuleEntries.map(
    ([, rule]) => rule
);

/** Stable ordered fully qualified rule ids. */
export const ruleIds: readonly GridRuleId[] = gridRuleEntries.map(([, rule]) =>
    toGridRuleId(rule.ruleName)
);

/** Rule ids included in the recommended shareable config. */
const recommendedRuleIds: readonly GridRuleId[] = gridRuleEntries
    .filter(([, rule]) => rule.docs.recommended)
    .map(([, rule]) => toGridRuleId(rule.ruleName));

/**
 * Build one shareable Stylelint config.
 *
 * @param enabledRuleIds - Rule ids to enable in the config.
 *
 * @returns Shareable Stylelint config.
 */
function createConfig(
    enabledRuleIds: readonly GridRuleId[]
): GridShareableConfig {
    return {
        plugins: [...plugins],
        rules: (() => {
            const rulesConfig: NonNullable<Config["rules"]> = {};

            for (const ruleId of enabledRuleIds) {
                rulesConfig[ruleId] = true;
            }

            return rulesConfig;
        })(),
    };
}

/** Shareable config exports exposed by the package. */
export const gridPluginConfigs: GridConfigMap = {
    "grid-all": createConfig(ruleIds),
    "grid-recommended": createConfig(recommendedRuleIds),
};

/** Stable ordered shareable config names. */
export const configNames: readonly GridConfigName[] = publicConfigNames;

/** Default export consumed by Stylelint when the package is used as a plugin. */
export default plugins;
