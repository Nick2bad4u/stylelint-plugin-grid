#!/usr/bin/env node

/**
 * @packageDocumentation
 * Run Stylelint 16 compatibility smoke checks in isolated temporary projects
 * so the repository manifests and working installation stay intact.
 */
// @ts-check

import { spawnSync } from "node:child_process";
import { copyFile, cp, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

import { parseNpmPackMetadata } from "./_internal/npm-pack-metadata.mjs";

const scriptsDirectoryPath = dirname(fileURLToPath(import.meta.url));
const repositoryRootPath = resolve(scriptsDirectoryPath, "..");
const stylelintCompatSmokeScriptPath = join(
    scriptsDirectoryPath,
    "stylelint-compat-smoke.mjs"
);
const stylelint16Specs = ["16.0.0", "^16.0.0"];

/** @param {string} prefix */
const createTempDirectory = (prefix) => mkdtemp(prefix);

/** @param {string} value */
const isWindowsAbsolutePath = (value) => /^[A-Za-z]:[\\/]/u.test(value);

/** @param {string} filePath */
const toFileHref = (filePath) => {
    if (isWindowsAbsolutePath(filePath)) {
        return new URL(`file:///${filePath.replaceAll("\\", "/")}`).href;
    }

    return pathToFileURL(resolve(filePath)).href;
};

/**
 * @typedef {Readonly<{
 *     args: readonly string[];
 *     captureOutput?: boolean;
 *     command: string;
 *     cwd: string;
 *     shell: boolean;
 * }>} CommandSpec
 */

/** @param {string} [platform] */
export const getNpmCommand = (platform = process.platform) =>
    platform === "win32" ? "npm.cmd" : "npm";

/** @param {NodeJS.ProcessEnv} [environment] */
export const getWindowsCommandShell = (environment = process.env) =>
    environment["ComSpec"] ?? environment["COMSPEC"] ?? "cmd.exe";

/**
 * @param {Readonly<{ argvEntry?: string; currentImportUrl: string }>} input
 */
export const isDirectExecution = ({ argvEntry, currentImportUrl }) =>
    typeof argvEntry === "string" && toFileHref(argvEntry) === currentImportUrl;

/**
 * @param {Readonly<{
 *     npmCommand?: string;
 *     platform?: string;
 *     repositoryRootPath?: string;
 *     tempDirectoryPath: string;
 * }>} input
 *
 * @returns {readonly CommandSpec[]}
 */
export const createPreparationCommands = ({
    npmCommand = getNpmCommand(),
    platform = process.platform,
    repositoryRootPath: targetRepositoryRootPath = repositoryRootPath,
    tempDirectoryPath,
}) => {
    const shell = platform === "win32";

    return [
        {
            args: ["run", "build"],
            command: npmCommand,
            cwd: targetRepositoryRootPath,
            shell,
        },
        {
            args: [
                "pack",
                "--json",
                "--ignore-scripts",
                "--pack-destination",
                tempDirectoryPath,
            ],
            captureOutput: true,
            command: npmCommand,
            cwd: targetRepositoryRootPath,
            shell,
        },
    ];
};

/**
 * @param {Readonly<{
 *     nodeCommand?: string;
 *     npmCommand?: string;
 *     platform?: string;
 *     runtimeDirectoryPath: string;
 * }>} input
 *
 * @returns {readonly CommandSpec[]}
 */
export const createRuntimeCommands = ({
    nodeCommand = process.execPath,
    npmCommand = getNpmCommand(),
    platform = process.platform,
    runtimeDirectoryPath,
}) => [
    {
        args: [
            "install",
            "--ignore-scripts",
            "--no-audit",
            "--no-fund",
        ],
        command: npmCommand,
        cwd: runtimeDirectoryPath,
        shell: platform === "win32",
    },
    {
        args: [
            join(runtimeDirectoryPath, "scripts", "stylelint-compat-smoke.mjs"),
            "--expect-stylelint-major=16",
        ],
        command: nodeCommand,
        cwd: runtimeDirectoryPath,
        shell: false,
    },
];

/**
 * @param {CommandSpec & Readonly<{ windowsCommandShell?: string }>} input
 *
 * @returns {string}
 */
export function runCommand({
    args,
    captureOutput = false,
    command,
    cwd,
    shell = false,
    windowsCommandShell = getWindowsCommandShell(),
}) {
    const shouldUseWindowsShell = process.platform === "win32" && shell;
    const childProcessEnvironment = Object.fromEntries(
        Object.entries(process.env).filter(
            ([name]) => name.toLowerCase() !== "npm_config_allow_scripts"
        )
    );
    const result = spawnSync(
        shouldUseWindowsShell ? windowsCommandShell : command,
        shouldUseWindowsShell
            ? [
                  "/d",
                  "/s",
                  "/c",
                  command,
                  ...args,
              ]
            : args,
        {
            cwd,
            encoding: captureOutput ? "utf8" : undefined,
            env: childProcessEnvironment,
            shell: false,
            stdio: captureOutput
                ? [
                      "ignore",
                      "pipe",
                      "inherit",
                  ]
                : "inherit",
            windowsHide: true,
        }
    );

    if (result.error !== undefined) {
        throw result.error;
    }

    if (result.status !== 0) {
        throw new Error(
            `Command failed (${String(result.status)}): ${command} ${args.join(" ")}`
        );
    }

    return typeof result.stdout === "string" ? result.stdout : "";
}

/**
 * @param {Readonly<{
 *     copyFileFn?: typeof copyFile;
 *     cpFn?: typeof cp;
 *     mkdirFn?: typeof mkdir;
 *     createTempDirectoryFn?: (prefix: string) => Promise<string>;
 *     nodeCommand?: string;
 *     npmCommand?: string;
 *     platform?: string;
 *     repositoryRootPath?: string;
 *     rmFn?: typeof rm;
 *     runCommandFn?: typeof runCommand;
 *     stylelintCompatSmokeScriptPath?: string;
 *     stylelintSpecs?: readonly string[];
 *     tmpDirectoryPath?: string;
 *     windowsCommandShell?: string;
 *     writeFileFn?: typeof writeFile;
 * }>} [input]
 */
export async function runStylelint16Compat({
    copyFileFn = copyFile,
    cpFn = cp,
    createTempDirectoryFn = createTempDirectory,
    mkdirFn = mkdir,
    nodeCommand = process.execPath,
    npmCommand = getNpmCommand(),
    platform = process.platform,
    repositoryRootPath: targetRepositoryRootPath = repositoryRootPath,
    rmFn = rm,
    runCommandFn = runCommand,
    stylelintCompatSmokeScriptPath:
        targetSmokeScriptPath = stylelintCompatSmokeScriptPath,
    stylelintSpecs = stylelint16Specs,
    tmpDirectoryPath = tmpdir(),
    windowsCommandShell = getWindowsCommandShell(),
    writeFileFn = writeFile,
} = {}) {
    const tempDirectoryPath = await createTempDirectoryFn(
        join(tmpDirectoryPath, "stylelint-plugin-grid-stylelint16-")
    );
    /** @type {unknown} */
    let primaryError;

    try {
        const [buildCommand, packCommand] = createPreparationCommands({
            npmCommand,
            platform,
            repositoryRootPath: targetRepositoryRootPath,
            tempDirectoryPath,
        });

        if (buildCommand === undefined || packCommand === undefined) {
            throw new Error(
                "Unable to create compatibility preparation commands."
            );
        }

        runCommandFn({ ...buildCommand, windowsCommandShell });
        const packOutput = runCommandFn({
            ...packCommand,
            windowsCommandShell,
        });
        const { filename } = parseNpmPackMetadata(packOutput);
        const packageArchivePath = join(tempDirectoryPath, filename);

        for (const [index, stylelintSpec] of stylelintSpecs.entries()) {
            const runtimeDirectoryPath = join(
                tempDirectoryPath,
                `runtime-${String(index + 1)}`
            );
            const runtimeScriptsDirectoryPath = join(
                runtimeDirectoryPath,
                "scripts"
            );
            const runtimePackageArchivePath = join(
                runtimeDirectoryPath,
                basename(packageArchivePath)
            );

            await mkdirFn(runtimeScriptsDirectoryPath, { recursive: true });
            await copyFileFn(packageArchivePath, runtimePackageArchivePath);
            await copyFileFn(
                targetSmokeScriptPath,
                join(runtimeScriptsDirectoryPath, "stylelint-compat-smoke.mjs")
            );
            await writeFileFn(
                join(runtimeDirectoryPath, "package.json"),
                `${JSON.stringify(
                    {
                        dependencies: {
                            picocolors: "1.1.1",
                            stylelint: stylelintSpec,
                            "stylelint-plugin-grid": `file:./${basename(runtimePackageArchivePath)}`,
                        },
                        private: true,
                        type: "module",
                    },
                    undefined,
                    2
                )}\n`,
                "utf8"
            );

            const [installCommand, smokeCommand] = createRuntimeCommands({
                nodeCommand,
                npmCommand,
                platform,
                runtimeDirectoryPath,
            });

            if (installCommand === undefined || smokeCommand === undefined) {
                throw new Error(
                    "Unable to create compatibility runtime commands."
                );
            }

            runCommandFn({ ...installCommand, windowsCommandShell });
            await cpFn(
                join(
                    runtimeDirectoryPath,
                    "node_modules",
                    "stylelint-plugin-grid",
                    "dist"
                ),
                join(runtimeDirectoryPath, "dist"),
                { recursive: true }
            );
            runCommandFn({ ...smokeCommand, windowsCommandShell });
        }
    } catch (error) {
        primaryError = error;
    }

    try {
        await rmFn(tempDirectoryPath, { force: true, recursive: true });
    } catch (cleanupError) {
        const contextualCleanupError = new Error(
            `Failed to remove compatibility directory: ${tempDirectoryPath}`,
            { cause: cleanupError }
        );

        if (primaryError !== undefined) {
            throw new AggregateError(
                [primaryError, contextualCleanupError],
                "Stylelint 16 compatibility check failed and cleanup also failed."
            );
        }

        throw contextualCleanupError;
    }

    if (primaryError !== undefined) {
        throw primaryError;
    }
}

/** @returns {Promise<void>} */
export async function runCli() {
    await runStylelint16Compat();
}

if (
    isDirectExecution({
        argvEntry: process.argv[1],
        currentImportUrl: import.meta.url,
    })
) {
    try {
        await runCli();
    } catch (error) {
        console.error("Stylelint 16 compatibility check failed:", error);
        process.exitCode = 1;
    }
}
