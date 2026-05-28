/**
 * @packageDocumentation
 * Static package and docs constants used throughout the Stylelint plugin runtime.
 */
import type { ArrayValues, UnknownRecord } from "type-fest";

import packageJson from "stylelint-plugin-grid/package.json" with { type: "json" };
import { keyIn } from "ts-extras";

/** Public npm package name. */
export const PACKAGE_NAME = "stylelint-plugin-grid";
/** Public Stylelint rule namespace. */
export const PLUGIN_NAMESPACE = "grid";
/** Public GitHub repository URL. */
export const REPOSITORY_URL =
    "https://github.com/Nick2bad4u/stylelint-plugin-grid";
/** Public documentation site URL. */
export const DOCS_SITE_URL =
    "https://nick2bad4u.github.io/stylelint-plugin-grid";
/** Base URL for authored rule documentation. */
export const DOCS_RULES_BASE_URL: `${string}/docs/rules` = `${DOCS_SITE_URL}/docs/rules`;
/** Supported shareable config names exported by this package. */
export const CONFIG_NAMES = ["grid-all", "grid-recommended"] as const;

/** Shareable config names exported by the plugin runtime. */
export type GridConfigName = ArrayValues<typeof CONFIG_NAMES>;

/**
 * Resolve package version from package.json data.
 *
 * @param pkg - Parsed package metadata value.
 *
 * @returns The package version, or `0.0.0` when unavailable.
 */
function getPackageVersion(pkg: unknown): string {
    return hasStringVersion(pkg) ? pkg.version : "0.0.0";
}

function hasStringVersion(
    pkg: unknown
): pkg is Readonly<{ version: string }> & UnknownRecord {
    return (
        isUnknownRecord(pkg) &&
        keyIn(pkg, "version") &&
        typeof pkg["version"] === "string"
    );
}

function isUnknownRecord(pkg: unknown): pkg is UnknownRecord {
    return typeof pkg === "object" && pkg !== null && !Array.isArray(pkg);
}

/** Published package version resolved from `package.json`. */
export const PACKAGE_VERSION: string = getPackageVersion(packageJson);

/**
 * Create the canonical docs URL for one authored rule page.
 */
export function createRuleDocsUrl(ruleName: string): string {
    return `${DOCS_RULES_BASE_URL}/${ruleName}`;
}

/**
 * Create a fully qualified Stylelint rule name for this plugin namespace.
 */
export function createRuleName<const T extends string>(
    ruleName: T
): `${typeof PLUGIN_NAMESPACE}/${T}` {
    return `${PLUGIN_NAMESPACE}/${ruleName}`;
}
