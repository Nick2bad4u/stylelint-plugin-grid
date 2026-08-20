export interface Stylelint16CompatCommandSpec {
    readonly args: readonly string[];
    readonly captureOutput?: boolean | undefined;
    readonly command: string;
    readonly cwd: string;
    readonly shell: boolean;
}

export function getNpmCommand(platform?: string): string;

export function getWindowsCommandShell(environment?: NodeJS.ProcessEnv): string;

export function isDirectExecution(input: {
    readonly argvEntry?: string | undefined;
    readonly currentImportUrl: string;
}): boolean;

export function createPreparationCommands(input: {
    readonly npmCommand?: string | undefined;
    readonly platform?: string | undefined;
    readonly repositoryRootPath?: string | undefined;
    readonly tempDirectoryPath: string;
}): readonly Stylelint16CompatCommandSpec[];

export function createRuntimeCommands(input: {
    readonly nodeCommand?: string | undefined;
    readonly npmCommand?: string | undefined;
    readonly platform?: string | undefined;
    readonly runtimeDirectoryPath: string;
}): readonly Stylelint16CompatCommandSpec[];

export function runCommand(
    input: Stylelint16CompatCommandSpec & {
        readonly windowsCommandShell?: string | undefined;
    }
): string;

export function runStylelint16Compat(input?: {
    readonly copyFileFn?:
        typeof import("node:fs/promises").copyFile | undefined;
    readonly cpFn?: typeof import("node:fs/promises").cp | undefined;
    readonly createTempDirectoryFn?:
        ((prefix: string) => Promise<string>) | undefined;
    readonly mkdirFn?: typeof import("node:fs/promises").mkdir | undefined;
    readonly nodeCommand?: string | undefined;
    readonly npmCommand?: string | undefined;
    readonly platform?: string | undefined;
    readonly repositoryRootPath?: string | undefined;
    readonly rmFn?: typeof import("node:fs/promises").rm | undefined;
    readonly runCommandFn?:
        | ((
              input: Stylelint16CompatCommandSpec & {
                  readonly windowsCommandShell?: string | undefined;
              }
          ) => string)
        | undefined;
    readonly stylelintCompatSmokeScriptPath?: string | undefined;
    readonly stylelintSpecs?: readonly string[] | undefined;
    readonly tmpDirectoryPath?: string | undefined;
    readonly windowsCommandShell?: string | undefined;
    readonly writeFileFn?:
        typeof import("node:fs/promises").writeFile | undefined;
}): Promise<void>;

export function runCli(): Promise<void>;
