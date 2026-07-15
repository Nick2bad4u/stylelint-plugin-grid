import { checkPackage, Package } from "@arethetypeswrong/core";
import { getExitCode } from "@arethetypeswrong/cli/internal/getExitCode";
import * as render from "@arethetypeswrong/cli/internal/render";
import { execFileSync } from "node:child_process";
import { mkdir, readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { parseNpmPackMetadata } from "./_internal/npm-pack-metadata.mjs";

const arguments_ = process.argv.slice(2);
const targetDirectory = path.resolve(
    arguments_.find(
        (argument, index) =>
            !argument.startsWith("-") && arguments_[index - 1] !== "--profile"
    ) ?? "."
);
const profileIndex = arguments_.indexOf("--profile");
const profile =
    profileIndex === -1 ? "strict" : (arguments_[profileIndex + 1] ?? "");

if (profile !== "strict") {
    throw new Error(`Unsupported ATTW validation profile: ${profile}`);
}

const tempDirectory = path.join(targetDirectory, "temp", "attw-pack");
const packDirectory = path.join(tempDirectory, "pack");
const extractDirectory = path.join(tempDirectory, "extract");

await rm(tempDirectory, { force: true, recursive: true });
await mkdir(packDirectory, { recursive: true });
await mkdir(extractDirectory, { recursive: true });

const npmCliPath = process.env["npm_execpath"];

if (!npmCliPath) {
    throw new Error("npm_execpath is required to run npm pack.");
}

const packOutput = execFileSync(
    process.execPath,
    [
        npmCliPath,
        "pack",
        "--pack-destination",
        packDirectory,
        "--json",
    ],
    {
        cwd: targetDirectory,
        encoding: "utf8",
        env: {
            ...process.env,
            npm_config_user_agent:
                process.env["npm_config_user_agent"] ?? "npm run-attw-pack",
        },
        stdio: [
            "ignore",
            "pipe",
            "inherit",
        ],
    }
);
const packMetadata = parseNpmPackMetadata(packOutput);
const tarballPath = path.join(packDirectory, packMetadata.filename);

execFileSync(
    "tar",
    [
        "-xzf",
        tarballPath,
        "-C",
        extractDirectory,
    ],
    {
        stdio: "inherit",
    }
);

const packageRoot = path.join(extractDirectory, "package");
const packageJsonPath = path.join(packageRoot, "package.json");
const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));

if (
    typeof packageJson !== "object" ||
    packageJson === null ||
    !("name" in packageJson) ||
    typeof packageJson.name !== "string" ||
    !("version" in packageJson) ||
    typeof packageJson.version !== "string"
) {
    throw new TypeError("Packed package.json is missing name or version.");
}

/** @type {Record<string, string | Uint8Array>} */
const packageFiles = {};

/** @param {string} directory */
const collectFiles = async (directory) => {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
        const entryPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            await collectFiles(entryPath);
        } else if (entry.isFile()) {
            const relativePath = path
                .relative(packageRoot, entryPath)
                .split(path.sep)
                .join("/");
            packageFiles[`/node_modules/${packageJson.name}/${relativePath}`] =
                await readFile(entryPath);
        }
    }
};

await collectFiles(packageRoot);

const packageAnalysis = await checkPackage(
    new Package(packageFiles, packageJson.name, packageJson.version),
    {}
);
/** @type {import("@arethetypeswrong/cli/internal/render").RenderOptions} */
const renderOptions = {
    color: process.stdout.isTTY,
    emoji: false,
    format: "table",
    ignoreResolutions: [],
    ignoreRules: [],
    summary: true,
};

if (packageAnalysis.types) {
    const output = await render.typed(packageAnalysis, renderOptions);

    if (output.length > 0) {
        console.log(output);
    }
} else {
    console.log(render.untyped(packageAnalysis));
}

process.exitCode = getExitCode(packageAnalysis, renderOptions);
