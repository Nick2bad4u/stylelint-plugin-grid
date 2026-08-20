import * as path from "node:path";
import { describe, expect, it } from "vitest";

import {
    createPreparationCommands,
    createRuntimeCommands,
    getNpmCommand,
    getWindowsCommandShell,
    isDirectExecution,
    runStylelint16Compat,
} from "../scripts/run-stylelint16-compat.mjs";

describe("run-stylelint16-compat wrapper", () => {
    it("creates isolated build, pack, install, and smoke commands", () => {
        expect.hasAssertions();

        expect(
            createPreparationCommands({
                npmCommand: "npm",
                platform: "linux",
                repositoryRootPath: "/repo",
                tempDirectoryPath: "/temp/compat",
            })
        ).toStrictEqual([
            {
                args: ["run", "build"],
                command: "npm",
                cwd: "/repo",
                shell: false,
            },
            {
                args: [
                    "pack",
                    "--json",
                    "--ignore-scripts",
                    "--pack-destination",
                    "/temp/compat",
                ],
                captureOutput: true,
                command: "npm",
                cwd: "/repo",
                shell: false,
            },
        ]);
        expect(
            createRuntimeCommands({
                nodeCommand: "node",
                npmCommand: "npm",
                platform: "linux",
                runtimeDirectoryPath: "/temp/compat/runtime-1",
            })
        ).toStrictEqual([
            {
                args: [
                    "install",
                    "--ignore-scripts",
                    "--no-audit",
                    "--no-fund",
                ],
                command: "npm",
                cwd: "/temp/compat/runtime-1",
                shell: false,
            },
            {
                args: [
                    path.join(
                        "/temp/compat/runtime-1",
                        "scripts",
                        "stylelint-compat-smoke.mjs"
                    ),
                    "--expect-stylelint-major=16",
                ],
                command: "node",
                cwd: "/temp/compat/runtime-1",
                shell: false,
            },
        ]);
    });

    it("tests two Stylelint 16 boundaries without restoring repository dependencies", async () => {
        expect.hasAssertions();

        const copiedFiles: string[] = [];
        const copiedDirectories: string[] = [];
        const createdDirectories: string[] = [];
        const executedCommands: string[] = [];
        const packageJsonFiles: string[] = [];
        const removedPaths: string[] = [];
        const tempDirectoryPath = "/temp/stylelint16-compat";

        await runStylelint16Compat({
            copyFileFn: (sourcePath, destinationPath) => {
                copiedFiles.push(
                    `${String(sourcePath)}->${String(destinationPath)}`
                );

                return Promise.resolve();
            },
            cpFn: (sourcePath, destinationPath) => {
                copiedDirectories.push(
                    `${String(sourcePath)}->${String(destinationPath)}`
                );

                return Promise.resolve();
            },
            createTempDirectoryFn: () => Promise.resolve(tempDirectoryPath),
            mkdirFn: (targetPath) => {
                createdDirectories.push(String(targetPath));

                return Promise.resolve(undefined);
            },
            nodeCommand: "node",
            npmCommand: "npm",
            platform: "linux",
            repositoryRootPath: "/repo",
            rmFn: (targetPath) => {
                removedPaths.push(String(targetPath));

                return Promise.resolve();
            },
            runCommandFn: (input) => {
                executedCommands.push(
                    `${input.command} ${input.args.join(" ")} @ ${input.cwd}`
                );

                return input.captureOutput === true
                    ? JSON.stringify([
                          { filename: "stylelint-plugin-grid.tgz" },
                      ])
                    : "";
            },
            stylelintCompatSmokeScriptPath:
                "/repo/scripts/stylelint-compat-smoke.mjs",
            stylelintSpecs: ["16.0.0", "16.26.1"],
            tmpDirectoryPath: "/temp",
            windowsCommandShell: "cmd.exe",
            writeFileFn: (targetPath, contents) => {
                if (
                    typeof targetPath !== "string" ||
                    typeof contents !== "string"
                ) {
                    throw new TypeError(
                        "Expected a text package manifest path."
                    );
                }

                packageJsonFiles.push(`${targetPath}:${contents}`);

                return Promise.resolve();
            },
        });

        expect(executedCommands).toHaveLength(6);
        expect(executedCommands).not.toContain(
            expect.stringContaining("--legacy-peer-deps")
        );
        expect(executedCommands).not.toContain(
            expect.stringContaining("npm ci")
        );
        expect(createdDirectories).toHaveLength(2);
        expect(copiedFiles).toHaveLength(4);
        expect(copiedDirectories).toHaveLength(2);
        expect(packageJsonFiles).toHaveLength(2);
        expect(packageJsonFiles[0]).toContain('"stylelint": "16.0.0"');
        expect(packageJsonFiles[1]).toContain('"stylelint": "16.26.1"');
        expect(removedPaths).toStrictEqual([tempDirectoryPath]);
    });

    it("always removes the isolated project after a failure", async () => {
        expect.hasAssertions();

        const removedPaths: string[] = [];

        await expect(
            runStylelint16Compat({
                createTempDirectoryFn: () => Promise.resolve("/temp/compat"),
                npmCommand: "npm",
                platform: "linux",
                repositoryRootPath: "/repo",
                rmFn: (targetPath) => {
                    removedPaths.push(String(targetPath));

                    return Promise.resolve();
                },
                runCommandFn: () => {
                    throw new Error("simulated build failure");
                },
                tmpDirectoryPath: "/temp",
            })
        ).rejects.toThrow("simulated build failure");
        expect(removedPaths).toStrictEqual(["/temp/compat"]);
    });

    it("preserves the primary failure when isolated cleanup also fails", async () => {
        expect.hasAssertions();

        let thrownError: unknown;

        try {
            await runStylelint16Compat({
                createTempDirectoryFn: () => Promise.resolve("/temp/compat"),
                npmCommand: "npm",
                platform: "linux",
                repositoryRootPath: "/repo",
                rmFn: () => Promise.reject(new Error("cleanup failed")),
                runCommandFn: () => {
                    throw new Error("build failed");
                },
                tmpDirectoryPath: "/temp",
            });
        } catch (error) {
            thrownError = error;
        }

        expect(thrownError).toBeInstanceOf(AggregateError);
        expect((thrownError as AggregateError).errors).toHaveLength(2);
        expect((thrownError as AggregateError).errors).toStrictEqual([
            expect.objectContaining({ message: "build failed" }),
            expect.objectContaining({
                message:
                    "Failed to remove compatibility directory: /temp/compat",
            }),
        ]);
    });

    it("provides Windows command and direct-execution helpers", () => {
        expect.hasAssertions();

        expect(getNpmCommand("win32")).toBe("npm.cmd");
        expect(getWindowsCommandShell({ COMSPEC: "custom-cmd.exe" })).toBe(
            "custom-cmd.exe"
        );
        expect(
            isDirectExecution({
                argvEntry: "C:/repo/scripts/run-stylelint16-compat.mjs",
                currentImportUrl:
                    "file:///C:/repo/scripts/run-stylelint16-compat.mjs",
            })
        ).toBe(true);
        expect(
            isDirectExecution({
                argvEntry: "C:/repo/test/run-stylelint16-compat.test.ts",
                currentImportUrl:
                    "file:///C:/repo/scripts/run-stylelint16-compat.mjs",
            })
        ).toBe(false);
    });
});
