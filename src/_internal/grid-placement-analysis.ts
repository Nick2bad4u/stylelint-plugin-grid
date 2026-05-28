/**
 * @packageDocumentation
 * Shared CSS Grid placement analysis helpers for public rules.
 */
import type { Declaration, Rule } from "postcss";

import { arrayFirst, isDefined, setHas } from "ts-extras";

import {
    splitTopLevelSlashes,
    splitTopLevelWhitespace,
} from "./grid-template-analysis.js";

/** CSS Grid placement declaration properties. */
export const gridPlacementProperties: ReadonlySet<string> = new Set([
    "grid-area",
    "grid-column",
    "grid-column-end",
    "grid-column-start",
    "grid-row",
    "grid-row-end",
    "grid-row-start",
]);

const strictIntegerPattern = /^[+\-]?\d+$/v;

/** Return direct declaration children for one PostCSS rule. */
export function getDirectDeclarations(
    rule: Readonly<Rule>
): readonly Declaration[] {
    return rule.nodes.filter(
        (node): node is Declaration => node.type === "decl"
    );
}

/** Return strict integer tokens used directly in one Grid line value. */
export function getGridLineIntegerTokens(value: string): readonly number[] {
    const integers: number[] = [];

    for (const token of splitTopLevelWhitespace(value)) {
        const integer = parseStrictInteger(token);

        if (isDefined(integer)) {
            integers.push(integer);
        }
    }

    return integers;
}

/** Return strict integer span counts from one Grid placement slot. */
export function getGridLineSpanCounts(value: string): readonly number[] {
    const tokens = splitTopLevelWhitespace(value);
    const hasSpan = tokens.some((token) => token.toLowerCase() === "span");

    if (!hasSpan) {
        return [];
    }

    return tokens.map((token) => parseStrictInteger(token)).filter(isDefined);
}

/** Split one Grid placement value into top-level slash-separated slots. */
export function getGridPlacementSlots(value: string): readonly string[] {
    return splitTopLevelSlashes(value);
}

/** Return whether a declaration is one of the Grid placement properties. */
export function isGridPlacementDeclaration(
    declaration: Readonly<Declaration>
): boolean {
    return setHas(gridPlacementProperties, declaration.prop.toLowerCase());
}

/** Parse a Grid line slot when it is exactly one integer token. */
export function parseStandaloneGridLineInteger(
    value: string
): number | undefined {
    const tokens = splitTopLevelWhitespace(value);

    return tokens.length === 1
        ? parseStrictInteger(arrayFirst(tokens) ?? "")
        : undefined;
}

function parseStrictInteger(value: string): number | undefined {
    if (!strictIntegerPattern.test(value)) {
        return undefined;
    }

    return Number.parseInt(value, 10);
}
