#!/usr/bin/env node

/**
 * @remarks
 * This script is intended for compatibility-matrix jobs that temporarily
 * install an older supported Stylelint major (for example 16.x) before running
 * the smoke check. We intentionally do not target Stylelint 15 because the
 * first officially supported ESM plugin line starts at Stylelint 16.
 *
 * @packageDocumentation
 * Smoke test the built plugin against an installed Stylelint runtime.
 */
// @ts-check

import { isDeepStrictEqual } from "node:util";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

import pc from "picocolors";

const expectedStylelintMajorArgumentPrefix = "--expect-stylelint-major=";
const builtPluginModuleUrl = new URL("../dist/plugin.js", import.meta.url);
const builtPluginCjsPath = fileURLToPath(
    new URL("../dist/plugin.cjs", import.meta.url)
);

/** @param {string} value */
const isWindowsAbsolutePath = (value) => /^[A-Za-z]:[\\/]/u.test(value);

/**
 * @param {string} filePath
 *
 * @returns {string}
 */
const toFileHref = (filePath) => {
    if (isWindowsAbsolutePath(filePath)) {
        const normalized = filePath.replaceAll("\\", "/");

        return new URL(`file:///${normalized}`).href;
    }

    return pathToFileURL(resolve(filePath)).href;
};

/**
 * @typedef {(string | import("stylelint").Plugin)[]} StylelintConfigPluginArray
 */

/**
 * @typedef {Readonly<{
 *     code: string;
 *     config: import("stylelint").Config;
 *     codeFilename: string;
 *     name: string;
 * }>} ConfigScenario
 */

/**
 * @typedef {Readonly<{
 *     invalidOptionWarnings?: readonly unknown[];
 *     parseErrors?: readonly unknown[];
 *     warnings?: readonly WarningLike[];
 * }>} StylelintResultLike
 */

/**
 * @typedef {Readonly<{
 *     column?: number;
 *     endColumn?: number;
 *     endLine?: number;
 *     line?: number;
 *     rule?: string;
 *     severity?: string;
 *     text?: string;
 * }>} WarningLike
 */

/**
 * @typedef {Readonly<{
 *     lint: (
 *         input: Readonly<{
 *             code: string;
 *             codeFilename: string;
 *             config: import("stylelint").Config;
 *             fix?: boolean;
 *         }>
 *     ) => Promise<
 *         Readonly<{
 *             code?: string;
 *             results: readonly StylelintResultLike[];
 *         }>
 *     >;
 * }>} StylelintLike
 */

/**
 * @typedef {Readonly<{
 *     "grid-all": import("stylelint").Config &
 *         Readonly<{
 *             plugins: StylelintConfigPluginArray;
 *             rules: Readonly<Record<string, unknown>>;
 *         }>;
 *     "grid-recommended": import("stylelint").Config &
 *         Readonly<{
 *             plugins: StylelintConfigPluginArray;
 *             rules: Readonly<Record<string, unknown>>;
 *         }>;
 * }>} BuiltPluginConfigs
 */

/**
 * @typedef {Readonly<{
 *     builtPluginCjs: unknown;
 *     configNames: readonly string[];
 *     gridPluginConfigs: BuiltPluginConfigs;
 *     meta: Readonly<{
 *         name: string;
 *         namespace: string;
 *     }>;
 *     plugin: StylelintConfigPluginArray;
 *     ruleIds: readonly string[];
 *     ruleNames: readonly string[];
 *     rules: Readonly<
 *         Record<
 *             string,
 *             Readonly<{
 *                 ruleName: string;
 *             }>
 *         >
 *     >;
 * }>} BuiltPluginSurface
 */

/**
 * @typedef {Pick<typeof console, "log">} InfoLogger
 */

/**
 * @typedef {Pick<typeof console, "error" | "log">} CliLogger
 */

/**
 * @param {readonly string[]} argv
 *
 * @returns {number | undefined}
 */
export function parseExpectedStylelintMajor(argv) {
    const matchingArgument = argv.find((argument) =>
        argument.startsWith(expectedStylelintMajorArgumentPrefix)
    );

    if (matchingArgument === undefined) {
        return undefined;
    }

    const majorString = matchingArgument.slice(
        expectedStylelintMajorArgumentPrefix.length
    );

    if (majorString.length === 0) {
        throw new Error(
            `Missing Stylelint major value in argument: ${matchingArgument}`
        );
    }

    if (!/^[1-9]\d*$/u.test(majorString)) {
        throw new Error(
            `Invalid Stylelint major value in argument: ${matchingArgument}`
        );
    }

    return Number.parseInt(majorString, 10);
}

/**
 * @param {Readonly<{
 *     argvEntry?: string | undefined;
 *     currentImportUrl: string;
 * }>} input
 *
 * @returns {boolean}
 */
export const isDirectExecution = ({ argvEntry, currentImportUrl }) =>
    typeof argvEntry === "string" && toFileHref(argvEntry) === currentImportUrl;

/**
 * @param {unknown} value
 *
 * @returns {value is Record<string, unknown>}
 */
function isRecord(value) {
    return typeof value === "object" && value !== null;
}

/**
 * @param {unknown} value
 *
 * @returns {Record<string, unknown>}
 */
function toRecord(value) {
    return isRecord(value) ? value : {};
}

/**
 * @param {unknown} value
 *
 * @returns {value is StylelintLike}
 */
function hasLintFunction(value) {
    if (typeof value !== "function" && !isRecord(value)) {
        return false;
    }

    return typeof Reflect.get(value, "lint") === "function";
}

/**
 * @param {unknown} error
 *
 * @returns {Error}
 */
function createMissingBuildArtifactsError(error) {
    return new Error(
        "Unable to load built plugin artifacts from dist/. Run `npm run build` before running the Stylelint compatibility smoke check.",
        {
            cause: error instanceof Error ? error : undefined,
        }
    );
}

/**
 * @param {unknown} error
 *
 * @returns {boolean}
 */
function isMissingBuildArtifactsIssue(error) {
    if (!(error instanceof Error)) {
        return false;
    }

    if (
        error.message.includes(
            "Run `npm run build` before running the Stylelint compatibility smoke check."
        )
    ) {
        return false;
    }

    return [
        "dist/plugin.js",
        "dist/plugin.cjs",
        String.raw`dist\plugin.js`,
        String.raw`dist\plugin.cjs`,
    ].some((artifactPath) => error.message.includes(artifactPath));
}

/**
 * @param {unknown} runtimeCandidate
 *
 * @returns {StylelintLike}
 */
export function normalizeStylelintRuntime(runtimeCandidate) {
    if (hasLintFunction(runtimeCandidate)) {
        return runtimeCandidate;
    }

    const moduleRecord = toRecord(runtimeCandidate);
    const defaultRuntimeCandidate = moduleRecord["default"];

    if (hasLintFunction(defaultRuntimeCandidate)) {
        return defaultRuntimeCandidate;
    }

    throw new TypeError("Unable to load a Stylelint runtime with lint().");
}

/**
 * @param {Readonly<{
 *     importModuleFn?: (() => Promise<unknown>) | undefined;
 * }>} [input]
 *
 * @returns {Promise<StylelintLike>}
 */
async function loadStylelintRuntime({
    importModuleFn = () => import("stylelint"),
} = {}) {
    const importedModule = await importModuleFn();

    return normalizeStylelintRuntime(importedModule);
}

/**
 * @param {Readonly<{
 *     readFileSyncFn?: typeof readFileSync;
 *     requireFn?: NodeJS.Require | undefined;
 * }>} [input]
 *
 * @returns {string}
 */
function getStylelintRuntimeVersion({
    readFileSyncFn = readFileSync,
    requireFn = createRequire(import.meta.url),
} = {}) {
    const stylelintPackageJsonPath = requireFn.resolve(
        "stylelint/package.json"
    );
    const packageJsonText = readFileSyncFn(stylelintPackageJsonPath, "utf8");
    const packageJson = /** @type {{ version?: unknown }} */ (
        JSON.parse(packageJsonText)
    );

    if (
        typeof packageJson.version !== "string" ||
        packageJson.version.length === 0
    ) {
        throw new Error("Unable to determine Stylelint runtime version.");
    }

    return packageJson.version;
}

/**
 * @param {number | undefined} expectedMajor
 * @param {Readonly<{
 *     logger?: InfoLogger | undefined;
 *     runtimeVersion: string;
 * }>} input
 *
 * @returns {number}
 */
export function assertStylelintMajor(
    expectedMajor,
    { logger = console, runtimeVersion }
) {
    const [runtimeMajorText] = runtimeVersion.split(".", 1);

    if (runtimeMajorText === undefined || runtimeMajorText.length === 0) {
        throw new Error(
            `Unable to parse Stylelint runtime version: ${runtimeVersion}`
        );
    }

    const runtimeMajor = Number.parseInt(runtimeMajorText, 10);

    if (Number.isNaN(runtimeMajor)) {
        throw new TypeError(
            `Unable to parse Stylelint runtime version: ${runtimeVersion}`
        );
    }

    if (expectedMajor !== undefined && runtimeMajor !== expectedMajor) {
        throw new Error(
            `Expected Stylelint major ${expectedMajor}, but detected ${runtimeVersion}.`
        );
    }

    logger.log(
        `${pc.green("✓")} Stylelint runtime ${pc.bold(runtimeVersion)} detected for compatibility smoke checks.`
    );

    return runtimeMajor;
}

/**
 * @param {unknown} candidate
 *
 * @returns {Readonly<{
 *     allRuleKeys: readonly string[];
 *     configNames: readonly unknown[];
 *     meta: unknown;
 *     recommendedRuleKeys: readonly string[];
 *     ruleIds: readonly unknown[];
 *     ruleKeys: readonly string[];
 *     ruleNames: readonly unknown[];
 * }>}
 */
function createSurfaceSnapshot(candidate) {
    const candidateRecord = toRecord(candidate);
    const pluginConfigsRecord = toRecord(candidateRecord["gridPluginConfigs"]);
    const allConfigRecord = toRecord(pluginConfigsRecord["grid-all"]);
    const recommendedConfigRecord = toRecord(
        pluginConfigsRecord["grid-recommended"]
    );

    return {
        allRuleKeys: Object.keys(toRecord(allConfigRecord["rules"])),
        configNames: Array.isArray(candidateRecord["configNames"])
            ? candidateRecord["configNames"]
            : [],
        meta: candidateRecord["meta"],
        recommendedRuleKeys: Object.keys(
            toRecord(recommendedConfigRecord["rules"])
        ),
        ruleIds: Array.isArray(candidateRecord["ruleIds"])
            ? candidateRecord["ruleIds"]
            : [],
        ruleKeys: Object.keys(toRecord(candidateRecord["rules"])),
        ruleNames: Array.isArray(candidateRecord["ruleNames"])
            ? candidateRecord["ruleNames"]
            : [],
    };
}

/**
 * @param {Readonly<{
 *     importModuleFn?: (() => Promise<unknown>) | undefined;
 *     requireFn?: NodeJS.Require | undefined;
 * }>} [input]
 *
 * @returns {Promise<BuiltPluginSurface>}
 */
async function loadBuiltPluginSurface({
    // eslint-disable-next-line no-unsanitized/method -- builtPluginModuleUrl is an internal fixed file URL under this repository
    importModuleFn = () => import(builtPluginModuleUrl.href),
    requireFn = createRequire(import.meta.url),
} = {}) {
    try {
        const builtPluginModule =
            /** @type {Readonly<Record<string, unknown>>} */ (
                await importModuleFn()
            );
        const builtPluginCjs = requireFn(builtPluginCjsPath);

        return {
            builtPluginCjs,
            configNames: /** @type {readonly string[]} */ (
                builtPluginModule["configNames"]
            ),
            gridPluginConfigs: /** @type {BuiltPluginConfigs} */ (
                builtPluginModule["gridPluginConfigs"]
            ),
            meta: /** @type {BuiltPluginSurface["meta"]} */ (
                builtPluginModule["meta"]
            ),
            plugin: /** @type {StylelintConfigPluginArray} */ (
                builtPluginModule["default"]
            ),
            ruleIds: /** @type {readonly string[]} */ (
                builtPluginModule["ruleIds"]
            ),
            ruleNames: /** @type {readonly string[]} */ (
                builtPluginModule["ruleNames"]
            ),
            rules: /** @type {BuiltPluginSurface["rules"]} */ (
                builtPluginModule["rules"]
            ),
        };
    } catch (error) {
        throw createMissingBuildArtifactsError(error);
    }
}

/**
 * Validate the public built plugin surface before running runtime smoke tests.
 *
 * @param {BuiltPluginSurface} surface
 * @param {Readonly<{
 *     logger?: InfoLogger | undefined;
 * }>} [input]
 */
export function assertPluginSurface(surface, { logger = console } = {}) {
    const {
        builtPluginCjs,
        configNames,
        gridPluginConfigs,
        meta,
        plugin,
        ruleIds,
        ruleNames,
        rules,
    } = surface;

    if (!Array.isArray(plugin)) {
        throw new TypeError(
            "Default plugin export must be an array (plugin pack)."
        );
    }

    if (typeof meta.name !== "string" || meta.name.length === 0) {
        throw new TypeError("Plugin metadata is missing a package name.");
    }

    if (meta.namespace !== "grid") {
        throw new TypeError(
            `Expected plugin namespace 'grid', received '${meta.namespace}'.`
        );
    }

    if (
        !Array.isArray(configNames) ||
        configNames.length === 0 ||
        !Array.isArray(gridPluginConfigs["grid-recommended"].plugins) ||
        !Array.isArray(gridPluginConfigs["grid-all"].plugins)
    ) {
        throw new TypeError("Config names export is unavailable.");
    }

    if (ruleNames.length !== ruleIds.length) {
        throw new TypeError("Rule names and rule ids are out of sync.");
    }

    for (const [ruleName, ruleDefinition] of Object.entries(rules)) {
        if (!ruleDefinition.ruleName.includes("/")) {
            throw new TypeError(
                `Rule '${ruleName}' is missing a namespaced ruleName.`
            );
        }
    }

    if (!Array.isArray(builtPluginCjs)) {
        throw new TypeError(
            "Built CommonJS entrypoint must expose the plugin pack as an array."
        );
    }

    if (
        !isDeepStrictEqual(
            createSurfaceSnapshot({
                configNames,
                gridPluginConfigs,
                meta,
                ruleIds,
                ruleNames,
                rules,
            }),
            createSurfaceSnapshot(builtPluginCjs)
        )
    ) {
        throw new TypeError(
            "Built CommonJS entrypoint must preserve named exports alongside the default plugin pack."
        );
    }

    logger.log(
        `${pc.green("✓")} Plugin surface exports are structurally valid.`
    );
}

/**
 * @param {ConfigScenario} scenario
 * @param {Readonly<{
 *     logger?: InfoLogger | undefined;
 *     stylelint: StylelintLike;
 * }>} input
 *
 * @returns {Promise<void>}
 */
export async function runConfigScenario(
    { code, codeFilename, config, name },
    { logger = console, stylelint }
) {
    const lintResult = await stylelint.lint({
        code,
        codeFilename,
        config,
    });
    const [result] = lintResult.results;

    if (result === undefined) {
        throw new Error(`${name}: Stylelint did not return a result.`);
    }

    const parseErrors = result.parseErrors ?? [];
    const invalidOptionWarnings = result.invalidOptionWarnings ?? [];
    const warnings = result.warnings ?? [];

    if (parseErrors.length > 0) {
        throw new Error(
            `${name}: encountered parse errors (${parseErrors.length}).`
        );
    }

    if (invalidOptionWarnings.length > 0) {
        throw new Error(
            `${name}: encountered invalid option warnings (${invalidOptionWarnings.length}).`
        );
    }

    if (warnings.length > 0) {
        throw new Error(
            `${name}: expected zero warnings, received ${warnings.length}.`
        );
    }

    logger.log(`${pc.green("✓")} ${pc.bold(name)} completed without warnings.`);
}

/**
 * @param {Pick<BuiltPluginSurface, "gridPluginConfigs" | "plugin">} input
 *
 * @returns {readonly ConfigScenario[]}
 */
export function createScenarios({ gridPluginConfigs, plugin }) {
    const baselineCssModule = `
.dashboard {
    display: grid;
    gap: 1rem;
    grid-template-areas:
        "header header"
        "nav main";
    grid-template-columns: 12rem minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
}

.header {
    grid-area: header;
}

.nav {
    grid-area: nav;
}

.main {
    grid-area: main;
}
`.trim();

    return [
        {
            code: baselineCssModule,
            codeFilename: "Component.module.css",
            config: {
                plugins: Array.from(plugin),
                rules: {},
            },
            name: "direct-plugin-pack-modules",
        },
        {
            code: baselineCssModule,
            codeFilename: "Component.module.css",
            config: {
                ...gridPluginConfigs["grid-recommended"],
                plugins: Array.from(
                    gridPluginConfigs["grid-recommended"].plugins
                ),
                rules: {
                    ...gridPluginConfigs["grid-recommended"].rules,
                },
            },
            name: "recommended-config-modules",
        },
        {
            code: baselineCssModule,
            codeFilename: "Component.module.css",
            config: {
                ...gridPluginConfigs["grid-all"],
                plugins: Array.from(gridPluginConfigs["grid-all"].plugins),
                rules: {
                    ...gridPluginConfigs["grid-all"].rules,
                },
            },
            name: "all-config-modules",
        },
    ];
}

/**
 * Require one Stylelint result without parse or option diagnostics.
 *
 * @param {Readonly<{ results: readonly StylelintResultLike[] }>} lintResult
 * @param {string} scenarioName
 *
 * @returns {StylelintResultLike}
 */
function requireValidLintResult(lintResult, scenarioName) {
    const [result] = lintResult.results;

    if (result === undefined) {
        throw new Error(`${scenarioName}: Stylelint did not return a result.`);
    }

    const parseErrors = result.parseErrors ?? [];
    const invalidOptionWarnings = result.invalidOptionWarnings ?? [];

    if (parseErrors.length > 0) {
        throw new Error(
            `${scenarioName}: encountered parse errors (${parseErrors.length}).`
        );
    }

    if (invalidOptionWarnings.length > 0) {
        throw new Error(
            `${scenarioName}: encountered invalid option warnings (${invalidOptionWarnings.length}).`
        );
    }

    return result;
}

/**
 * Verify one exact public-rule diagnostic through the recommended config.
 *
 * @param {Readonly<{
 *     config: import("stylelint").Config;
 *     stylelint: StylelintLike;
 * }>} input
 * @param {Readonly<{ logger?: InfoLogger | undefined }>} [options]
 *
 * @returns {Promise<void>}
 */
async function runDiagnosticScenario(
    { config, stylelint },
    { logger = console } = {}
) {
    const scenarioName = "recommended-config-invalid-diagnostic";
    const lintResult = await stylelint.lint({
        code: ".item { grid-column: 0 / 2; }",
        codeFilename: "invalid.css",
        config,
    });
    const result = requireValidLintResult(lintResult, scenarioName);
    const warnings = result.warnings ?? [];

    if (warnings.length !== 1) {
        throw new Error(
            `${scenarioName}: expected one warning, received ${warnings.length}.`
        );
    }

    const [warning] = warnings;
    const actualWarning = {
        column: warning?.column,
        endColumn: warning?.endColumn,
        endLine: warning?.endLine,
        line: warning?.line,
        rule: warning?.rule,
        severity: warning?.severity,
        text: warning?.text,
    };
    const expectedWarning = {
        column: 22,
        endColumn: 23,
        endLine: 1,
        line: 1,
        rule: "grid/no-zero-grid-lines",
        severity: "error",
        text: "Do not use Grid line `0`; CSS Grid line numbering starts at `1` and `-1`. (grid/no-zero-grid-lines)",
    };

    if (!isDeepStrictEqual(actualWarning, expectedWarning)) {
        throw new Error(`${scenarioName}: warning contract did not match.`);
    }

    logger.log(`${pc.green("✓")} ${pc.bold(scenarioName)} matched exactly.`);
}

/**
 * Verify exact, parseable, warning-free, idempotent autofix behavior.
 *
 * @param {Readonly<{
 *     config: import("stylelint").Config;
 *     stylelint: StylelintLike;
 * }>} input
 * @param {Readonly<{ logger?: InfoLogger | undefined }>} [options]
 *
 * @returns {Promise<void>}
 */
async function runFixScenario(
    { config, stylelint },
    { logger = console } = {}
) {
    const scenarioName = "recommended-config-gap-autofix";
    const source =
        ".layout { grid-gap: 1rem; grid-column-gap: 2rem; grid-row-gap: 3rem; }";
    const expected = ".layout { gap: 1rem; column-gap: 2rem; row-gap: 3rem; }";
    const firstPass = await stylelint.lint({
        code: source,
        codeFilename: "fix.css",
        config,
        fix: true,
    });
    const firstResult = requireValidLintResult(firstPass, scenarioName);

    if (firstPass.code !== expected) {
        throw new Error(`${scenarioName}: first-pass output did not match.`);
    }

    if ((firstResult.warnings ?? []).length > 0) {
        throw new Error(`${scenarioName}: first pass retained warnings.`);
    }

    const secondPass = await stylelint.lint({
        code: firstPass.code,
        codeFilename: "fix.css",
        config,
        fix: true,
    });
    const secondResult = requireValidLintResult(secondPass, scenarioName);

    if (secondPass.code !== expected) {
        throw new Error(
            `${scenarioName}: second-pass output was not idempotent.`
        );
    }

    if ((secondResult.warnings ?? []).length > 0) {
        throw new Error(`${scenarioName}: second pass retained warnings.`);
    }

    logger.log(
        `${pc.green("✓")} ${pc.bold(scenarioName)} fixed exactly and idempotently.`
    );
}

/**
 * @param {Readonly<{
 *     argv?: readonly string[];
 *     loadBuiltPluginSurfaceFn?:
 *         (() => Promise<BuiltPluginSurface>) | undefined;
 *     loadStylelintFn?: (() => Promise<StylelintLike>) | undefined;
 *     logger?: InfoLogger | undefined;
 *     stylelintRuntimeVersion?: string | undefined;
 * }>} [input]
 *
 * @returns {Promise<void>}
 */
export async function runStylelintCompatSmoke({
    argv = process.argv.slice(2),
    loadBuiltPluginSurfaceFn = loadBuiltPluginSurface,
    loadStylelintFn = loadStylelintRuntime,
    logger = console,
    stylelintRuntimeVersion,
} = {}) {
    const expectedStylelintMajor = parseExpectedStylelintMajor(argv);
    const runtimeVersion =
        stylelintRuntimeVersion ?? getStylelintRuntimeVersion();

    logger.log(
        pc.bold(pc.cyan("Running Stylelint compatibility smoke checks..."))
    );

    assertStylelintMajor(expectedStylelintMajor, {
        logger,
        runtimeVersion,
    });

    const stylelint = await loadStylelintFn();
    const builtPluginSurface = await loadBuiltPluginSurfaceFn().catch(
        (error) => {
            if (isMissingBuildArtifactsIssue(error)) {
                throw createMissingBuildArtifactsError(error);
            }

            throw error;
        }
    );

    assertPluginSurface(builtPluginSurface, { logger });

    for (const scenario of createScenarios({
        gridPluginConfigs: builtPluginSurface.gridPluginConfigs,
        plugin: builtPluginSurface.plugin,
    })) {
        await runConfigScenario(scenario, {
            logger,
            stylelint,
        });
    }

    const recommendedConfig = {
        ...builtPluginSurface.gridPluginConfigs["grid-recommended"],
        plugins: Array.from(
            builtPluginSurface.gridPluginConfigs["grid-recommended"].plugins
        ),
        rules: {
            ...builtPluginSurface.gridPluginConfigs["grid-recommended"].rules,
        },
    };

    await runDiagnosticScenario(
        { config: recommendedConfig, stylelint },
        { logger }
    );
    await runFixScenario({ config: recommendedConfig, stylelint }, { logger });

    logger.log(
        pc.bold(pc.green("Stylelint compatibility smoke checks passed."))
    );
}

/**
 * @param {Readonly<{
 *     argv?: readonly string[];
 *     logger?: CliLogger | undefined;
 * }>} [input]
 *
 * @returns {Promise<number>}
 */
export async function runCli({
    argv = process.argv.slice(2),
    logger = console,
} = {}) {
    try {
        await runStylelintCompatSmoke({
            argv,
            logger,
        });

        return 0;
    } catch (error) {
        logger.error(error instanceof Error ? error.message : String(error));

        return 1;
    }
}

if (
    isDirectExecution({
        argvEntry: process.argv[1],
        currentImportUrl: import.meta.url,
    })
) {
    const exitCode = await runCli();

    if (exitCode !== 0) {
        process.exitCode = exitCode;
    }
}
