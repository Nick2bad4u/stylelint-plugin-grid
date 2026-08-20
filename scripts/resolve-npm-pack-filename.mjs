import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { parseNpmPackMetadata } from "./_internal/npm-pack-metadata.mjs";

/**
 * Read npm pack JSON metadata and print its single safe tarball basename.
 *
 * @param {readonly string[]} arguments_
 *
 * @returns {Promise<string>}
 */
export const resolveNpmPackFilename = async (arguments_) => {
    const [metadataPath, ...extraArguments] = arguments_;

    if (!metadataPath || extraArguments.length > 0) {
        throw new TypeError(
            "Usage: node scripts/resolve-npm-pack-filename.mjs <npm-pack-metadata.json>"
        );
    }

    return parseNpmPackMetadata(await readFile(metadataPath, "utf8")).filename;
};

const isDirectExecution =
    process.argv[1] !== undefined &&
    path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
    process.stdout.write(await resolveNpmPackFilename(process.argv.slice(2)));
}
