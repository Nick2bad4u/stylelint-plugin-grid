/**
 * @packageDocumentation
 * Shared CSS Grid declaration analysis for public rules.
 */
import type { Container, Declaration, Root, Rule } from "postcss";

import {
    arrayFirst,
    isDefined,
    isEmpty,
    isInteger,
    safeCastTo,
    setHas,
} from "ts-extras";

/** One named area rectangle computed from a parsed template. */
export type GridAreaShape = Readonly<{
    bottom: number;
    left: number;
    name: string;
    right: number;
    top: number;
}>;

/** One `grid-area: <custom-ident>` usage. */
export type GridAreaUsage = Readonly<{
    declaration: Declaration;
    name: string;
    selector?: string;
}>;

/** One parsed `grid-template-areas` declaration. */
export type GridTemplateAreas = Readonly<{
    areaNames: readonly string[];
    declaration: Declaration;
    diagnostics: readonly GridTemplateDiagnostic[];
    rows: readonly (readonly string[])[];
}>;

/** One structural issue found while parsing `grid-template-areas`. */
export type GridTemplateDiagnostic = Readonly<{
    message: string;
    token?: string;
}>;

const cssWideKeywords: ReadonlySet<string> = new Set([
    "inherit",
    "initial",
    "revert",
    "revert-layer",
    "unset",
]);

const reservedGridAreaIdents: ReadonlySet<string> = new Set(["auto", "span"]);

const customIdentPattern = /^-?[A-Z_a-z][\w\-]*$/v;
const blankAreaPattern = /^\.+$/v;

/** Collect all single-name `grid-area` usages in source order. */
export function collectGridAreaUsages(root: Root): readonly GridAreaUsage[] {
    const usages: GridAreaUsage[] = [];

    root.walkDecls("grid-area", (declaration) => {
        const name = parseSingleGridAreaName(declaration.value);

        if (!isDefined(name)) {
            return;
        }

        const selector = getOwningRule(declaration)?.selector;

        usages.push({
            declaration,
            name,
            ...(isDefined(selector) ? { selector } : {}),
        });
    });

    return usages;
}

/** Collect parsed `grid-template-areas` declarations in source order. */
export function collectGridTemplateAreas(
    root: Root
): readonly GridTemplateAreas[] {
    const templates: GridTemplateAreas[] = [];

    root.walkDecls("grid-template-areas", (declaration) => {
        const template = parseGridTemplateAreas(declaration);

        if (template.rows.length > 0 || template.diagnostics.length > 0) {
            templates.push(template);
        }
    });

    return templates;
}

/** Count top-level CSS Grid tracks, or return undefined for dynamic lists. */
export function countGridTracks(value: string): number | undefined {
    const tokens: string[] = [];
    let count = 0;

    for (const token of splitTopLevelWhitespace(value)) {
        if (!isLineNameList(token)) {
            tokens.push(token);
        }
    }

    for (const token of tokens) {
        const repeatCount = countRepeatTracks(token);

        if (!isDefined(repeatCount) && token.startsWith("repeat(")) {
            return undefined;
        }

        count += repeatCount ?? 1;
    }

    return count;
}

/** Find a sibling declaration on the same rule/atrule block. */
export function findSiblingDeclaration(
    declaration: Readonly<Declaration>,
    propertyName: string
): Declaration | undefined {
    const parent = safeCastTo<Container | undefined>(declaration.parent);
    let match: Declaration | null = null;

    parent?.walkDecls(propertyName, (candidate) => {
        if (candidate.parent === parent) {
            match = candidate;
        }
    });

    return match ?? undefined;
}

/** Return each named area's bounding box from a parsed template. */
export function getAreaShapes(
    template: Readonly<GridTemplateAreas>
): readonly GridAreaShape[] {
    const shapes = new Map<string, GridAreaShape>();

    for (const [rowIndex, row] of template.rows.entries()) {
        for (const [columnIndex, token] of row.entries()) {
            if (!isBlankAreaToken(token) && isGridAreaName(token)) {
                const current = shapes.get(token);

                shapes.set(
                    token,
                    isDefined(current)
                        ? {
                              ...current,
                              bottom: Math.max(current.bottom, rowIndex),
                              left: Math.min(current.left, columnIndex),
                              right: Math.max(current.right, columnIndex),
                              top: Math.min(current.top, rowIndex),
                          }
                        : {
                              bottom: rowIndex,
                              left: columnIndex,
                              name: token,
                              right: columnIndex,
                              top: rowIndex,
                          }
                );
            }
        }
    }

    // eslint-disable-next-line canonical/no-use-extend-native -- The repo already targets Array#toSorted; this avoids mutating the collected shape list.
    return [...shapes.values()].toSorted((left, right) =>
        left.name.localeCompare(right.name)
    );
}

/** Return whether a token is a valid blank cell marker. */
export function isBlankAreaToken(token: string): boolean {
    return blankAreaPattern.test(token);
}

/** Return whether a token is accepted as a conservative CSS custom ident. */
export function isGridAreaName(token: string): boolean {
    return (
        customIdentPattern.test(token) &&
        !setHas(cssWideKeywords, token.toLowerCase()) &&
        !setHas(reservedGridAreaIdents, token.toLowerCase())
    );
}

/** Return whether a named area fills its full rectangle. */
export function isRectangularArea(
    template: Readonly<GridTemplateAreas>,
    shape: Readonly<GridAreaShape>
): boolean {
    for (let rowIndex = shape.top; rowIndex <= shape.bottom; rowIndex += 1) {
        const row = template.rows[rowIndex];

        if (!isDefined(row)) {
            return false;
        }

        for (
            let columnIndex = shape.left;
            columnIndex <= shape.right;
            columnIndex += 1
        ) {
            if (row[columnIndex] !== shape.name) {
                return false;
            }
        }
    }

    return true;
}

/** Parse one `grid-template-areas` declaration. */
export function parseGridTemplateAreas(
    declaration: Declaration
): GridTemplateAreas {
    const trimmedValue = declaration.value.trim();

    if (trimmedValue === "" || trimmedValue.toLowerCase() === "none") {
        return {
            areaNames: [],
            declaration,
            diagnostics: [],
            rows: [],
        };
    }

    const rowTexts = extractCssStringLiterals(trimmedValue);
    const diagnostics: GridTemplateDiagnostic[] = [];

    if (isEmpty(rowTexts)) {
        diagnostics.push({
            message:
                "`grid-template-areas` must contain one or more quoted row strings.",
        });
    }

    const rows = rowTexts.map(
        (rowText) => rowText.trim().match(/\S+/gv) ?? [""]
    );

    for (const [rowIndex, row] of rows.entries()) {
        if (row.length === 1 && arrayFirst(row) === "") {
            diagnostics.push({
                message: `Grid template row ${String(rowIndex + 1)} is empty.`,
            });
        } else {
            for (const token of row) {
                if (!isBlankAreaToken(token) && !isGridAreaName(token)) {
                    diagnostics.push({
                        message: `Grid area token "${token}" is not a valid area name or blank "." marker.`,
                        token,
                    });
                }
            }
        }
    }

    const expectedWidth = arrayFirst(rows)?.length;

    if (isDefined(expectedWidth)) {
        for (const [rowIndex, row] of rows.entries()) {
            if (row.length !== expectedWidth) {
                diagnostics.push({
                    message: `Grid template row ${String(rowIndex + 1)} has ${String(row.length)} columns, but row 1 has ${String(expectedWidth)}.`,
                });
            }
        }
    }

    return {
        areaNames: getAreaNames(rows),
        declaration,
        diagnostics,
        rows,
    };
}

function countRepeatTracks(token: string): number | undefined {
    if (!token.startsWith("repeat(") || !token.endsWith(")")) {
        return undefined;
    }

    const body = token.slice("repeat(".length, -1);
    const [repeatText, trackListText] = splitTopLevelCommas(body);
    const repeat = Number.parseInt(repeatText?.trim() ?? "", 10);

    if (
        !isInteger(repeat) ||
        repeat < 0 ||
        String(repeat) !== repeatText?.trim() ||
        !isDefined(trackListText)
    ) {
        return undefined;
    }

    const innerTrackCount = countGridTracks(trackListText);

    return isDefined(innerTrackCount) ? repeat * innerTrackCount : undefined;
}

function extractCssStringLiterals(value: string): readonly string[] {
    const rows: string[] = [];
    const stringPattern =
        /"(?<doubleQuotedRow>(?:\\.|[^"\\])*)"|'(?<singleQuotedRow>(?:\\.|[^'\\])*)'/vy;
    let index = 0;

    while (index < value.length) {
        while (/\s/v.test(value[index] ?? "")) {
            index += 1;
        }

        stringPattern.lastIndex = index;
        const match = stringPattern.exec(value);

        if (match === null) {
            return rows;
        }

        rows.push(
            match.groups?.["doubleQuotedRow"] ??
                match.groups?.["singleQuotedRow"] ??
                ""
        );
        index = stringPattern.lastIndex;
    }

    return rows;
}

function getAreaNames(rows: readonly (readonly string[])[]): readonly string[] {
    const names = new Set<string>();

    for (const row of rows) {
        for (const token of row) {
            if (!isBlankAreaToken(token) && isGridAreaName(token)) {
                names.add(token);
            }
        }
    }

    // eslint-disable-next-line canonical/no-use-extend-native -- The repo already targets Array#toSorted; this keeps the returned area-name list immutable.
    return [...names].toSorted((left, right) => left.localeCompare(right));
}

function getOwningRule(declaration: Readonly<Declaration>): Rule | undefined {
    return declaration.parent?.type === "rule" ? declaration.parent : undefined;
}

function isLineNameList(token: string): boolean {
    return token.startsWith("[") && token.endsWith("]");
}

function parseSingleGridAreaName(value: string): string | undefined {
    const name = value.trim();

    if (
        name.includes("/") ||
        name.includes("(") ||
        name.includes(")") ||
        !isGridAreaName(name)
    ) {
        return undefined;
    }

    return name;
}

function splitTopLevel(
    value: string,
    separatorPattern: RegExp
): readonly string[] {
    const tokens: string[] = [];
    let bracketDepth = 0;
    let parenthesisDepth = 0;
    let tokenStart = 0;

    for (let index = 0; index < value.length; index += 1) {
        const character = value[index] ?? "";

        switch (character) {
            case "(": {
                parenthesisDepth += 1;

                break;
            }
            case ")": {
                parenthesisDepth = Math.max(0, parenthesisDepth - 1);

                break;
            }
            case "[": {
                bracketDepth += 1;

                break;
            }
            case "]": {
                bracketDepth = Math.max(0, bracketDepth - 1);

                break;
            }
            // No default
        }

        if (
            bracketDepth === 0 &&
            parenthesisDepth === 0 &&
            separatorPattern.test(character)
        ) {
            const token = value.slice(tokenStart, index).trim();

            if (token !== "") {
                tokens.push(token);
            }

            tokenStart = index + 1;
        }
    }

    const finalToken = value.slice(tokenStart).trim();

    if (finalToken !== "") {
        tokens.push(finalToken);
    }

    return tokens;
}

function splitTopLevelCommas(value: string): readonly string[] {
    return splitTopLevel(value, /,/v);
}

function splitTopLevelWhitespace(value: string): readonly string[] {
    return splitTopLevel(value, /\s/v);
}
