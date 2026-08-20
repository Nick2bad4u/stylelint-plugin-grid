import stylelintPackageJson from "stylelint/package.json" with { type: "json" };
import { isDefined } from "ts-extras";

const reportFixCallbackMinimumMajor = 16;
const reportFixCallbackMinimumMinor = 7;
const stylelintVersionPattern = /^(?<major>\d+)\.(?<minor>\d+)(?:\.|$)/v;

/**
 * Determine whether a Stylelint version supports `report({ fix })`.
 *
 * Stylelint added the public report callback in 16.7.0. Earlier supported
 * Stylelint 16 releases require the legacy `context.fix` mutation path.
 */
export function supportsReportFixCallback(version: string): boolean {
    const match = stylelintVersionPattern.exec(version);
    const majorText = match?.groups?.["major"];
    const minorText = match?.groups?.["minor"];

    if (!isDefined(majorText) || !isDefined(minorText)) {
        // Prefer the current public API for an unrecognized future version so
        // we do not access Stylelint's deprecated `context.fix` getter.
        return true;
    }

    const major = Number(majorText);
    const minor = Number(minorText);

    return (
        major > reportFixCallbackMinimumMajor ||
        (major === reportFixCallbackMinimumMajor &&
            minor >= reportFixCallbackMinimumMinor)
    );
}

/** Whether the installed Stylelint runtime supports `report({ fix })`. */
export const supportsInstalledStylelintReportFixCallback: boolean =
    supportsReportFixCallback(stylelintPackageJson.version);
