import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readText = (path: string): string => readFileSync(path, "utf8");
const readJson = (path: string): unknown => JSON.parse(readText(path));

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const readPackageJson = (path: string): Record<string, unknown> => {
    const packageJson = readJson(path);

    if (!isRecord(packageJson)) {
        throw new TypeError(`${path} must contain a JSON object.`);
    }

    return packageJson;
};

describe("npm release safety policy", () => {
    const packageJson = readPackageJson("package.json");
    const docsPackageJson = readPackageJson("docs/docusaurus/package.json");
    const expectedPackageManager = "npm@12.0.2";

    it("pins one npm 12 version across the workspace", () => {
        expect.hasAssertions();

        expect(packageJson["packageManager"]).toBe(expectedPackageManager);
        expect(docsPackageJson["packageManager"]).toBe(expectedPackageManager);
    });

    it("enforces exact lifecycle-script decisions", () => {
        expect.hasAssertions();

        expect(packageJson["allowScripts"]).toStrictEqual({
            "@swc/core@1.16.1": true,
            "core-js@3.50.0": false,
            "esbuild@0.28.2": true,
            "fsevents@2.3.3": false,
            "unrs-resolver@1.12.2": true,
        });
        expect(readText(".npmrc").trim().split(/\r?\n/v)).toStrictEqual([
            "strict-allow-scripts=true",
            "allow-git=none",
            "allow-remote=none",
        ]);
    });

    it("does not bypass npm dependency resolution in automation", () => {
        expect.hasAssertions();

        const automation = [
            readText("CONTRIBUTING.md"),
            readText("package.json"),
            readText(".github/workflows/ci.yml"),
            readText(".github/workflows/deploy-docusaurus.yml"),
            readText(".github/workflows/release.yml"),
        ].join("\n");

        expect(automation).not.toMatch(/npm (?:ci|install)[^\n]*--force/v);
        expect(automation).not.toContain("--legacy-peer-deps");
        expect(automation).not.toContain("--dangerously-allow-all-scripts");
    });

    it("builds config inspectors from locked local dependencies", () => {
        expect.hasAssertions();

        const scripts = packageJson["scripts"];
        const devDependencies = packageJson["devDependencies"];

        if (!isRecord(scripts) || !isRecord(devDependencies)) {
            throw new TypeError(
                "package.json scripts and devDependencies must be objects."
            );
        }

        expect(devDependencies["@eslint/config-inspector"]).toBe("^3.0.4");
        expect(devDependencies["stylelint-config-inspector"]).toBe("^2.3.5");
        expect(scripts["build:eslint-inspector"]).toMatch(
            /^config-inspector build /v
        );
        expect(scripts["build:stylelint-inspector"]).toMatch(
            /^stylelint-config-inspector build /v
        );
        expect(Object.values(scripts).join("\n")).not.toContain("@latest");
    });

    it("bootstraps npm 12 outside the project before project npm commands", () => {
        expect.hasAssertions();

        const workflows = [
            readText(".github/workflows/ci.yml"),
            readText(".github/workflows/deploy-docusaurus.yml"),
            readText(".github/workflows/release.yml"),
        ].join("\n");
        const bootstrapWorkingDirectories = workflows.match(
            /working-directory: "\$\{\{ runner\.temp \}\}"/gv
        );
        const disabledAutomaticCaches = workflows.match(
            /package-manager-cache: false/gv
        );

        expect(bootstrapWorkingDirectories).toHaveLength(4);
        expect(disabledAutomaticCaches).toHaveLength(4);
        expect(workflows).not.toContain('cache: "npm"');
        expect(workflows).toContain(
            "require(require('node:path').join(process.env.GITHUB_WORKSPACE, 'package.json'))"
        );
    });
});

describe("release workflow transaction", () => {
    const releaseWorkflow = readText(".github/workflows/release.yml");

    it("uses an explicit release staging allowlist", () => {
        expect.hasAssertions();

        expect(releaseWorkflow).toContain(
            "git add -- package.json package-lock.json"
        );
        expect(releaseWorkflow).not.toMatch(/git add (?:-A|\.)/v);
        expect(releaseWorkflow).toContain(
            "expected_files=(package-lock.json package.json)"
        );
    });

    it("guards the verified source and pushes commit and tag atomically", () => {
        expect.hasAssertions();

        const tagVariable = ["$", "{TAG}"].join("");

        expect(releaseWorkflow).toContain("Record immutable release source");
        expect(releaseWorkflow).toContain(
            "Ensure verification did not modify tracked files"
        );
        expect(releaseWorkflow).toContain("git push --atomic origin");
        expect(releaseWorkflow).toMatch(
            /concurrency:\s+group: "\$\{\{ github\.workflow \}\}-\$\{\{ github\.repository \}\}"[\s\S]*?cancel-in-progress: "\$\{\{ false \}\}"/v
        );
        expect(releaseWorkflow).toContain(
            `"refs/tags/${tagVariable}:refs/tags/${tagVariable}"`
        );
    });

    it("rejects duplicate targets and unsafe pack metadata", () => {
        expect.hasAssertions();

        expect(releaseWorkflow).toContain(
            "Prevent duplicate tag or GitHub release"
        );
        expect(releaseWorkflow).toContain(
            "scripts/resolve-npm-pack-filename.mjs"
        );
        expect(releaseWorkflow).toContain(
            'npm pack --json --ignore-scripts --pack-destination "$assets_dir"'
        );
        expect(releaseWorkflow).toContain("overwrite_files: false");
    });

    it("pins Actionlint to the v1.7.12 commit", () => {
        expect.hasAssertions();

        expect(releaseWorkflow).toContain(
            "github.com/rhysd/actionlint/cmd/actionlint@914e7df21a07ef503a81201c76d2b11c789d3fca"
        );
    });
});
