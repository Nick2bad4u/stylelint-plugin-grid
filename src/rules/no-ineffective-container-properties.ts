import type { Declaration } from "postcss";

import stylelint, { type RuleBase } from "stylelint";
import { isDefined, setHas } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import { getDirectDeclarations } from "../_internal/grid-placement-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("no-ineffective-container-properties");
const messages: {
    rejected: (propertyName: string, display: string) => string;
} = ruleMessages(ruleName, {
    rejected: (propertyName: string, display: string): string =>
        `\`${propertyName}\` has no grid-container effect when the final same-block \`display\` value is \`${display}\`; use \`grid\` or \`inline-grid\`, or remove the grid container declaration.`,
});

const docs = {
    description:
        "Disallow CSS Grid container declarations in blocks whose final literal display value is not grid-capable.",
    recommended: true,
    url: createRuleDocsUrl("no-ineffective-container-properties"),
} as const;

const gridContainerProperties: ReadonlySet<string> = new Set([
    "grid",
    "grid-auto-columns",
    "grid-auto-flow",
    "grid-auto-rows",
    "grid-template",
    "grid-template-areas",
    "grid-template-columns",
    "grid-template-rows",
]);

const gridDisplayValues: ReadonlySet<string> = new Set(["grid", "inline-grid"]);

const nonGridDisplayValues: ReadonlySet<string> = new Set([
    "block",
    "contents",
    "flex",
    "flow-root",
    "inline",
    "inline-block",
    "inline-flex",
    "inline-table",
    "list-item",
    "none",
    "table",
]);

function getLastLiteralDisplay(
    declarations: readonly Declaration[]
): Declaration | undefined {
    return declarations.findLast(
        (declaration) =>
            declaration.prop.toLowerCase() === "display" &&
            isDefined(getLiteralDisplayValue(declaration.value))
    );
}

function getLiteralDisplayValue(value: string): string | undefined {
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue.includes("(") || normalizedValue.includes(")")) {
        return undefined;
    }

    return normalizedValue;
}

const ruleFunction: RuleBase<boolean, undefined> =
    (primary) => (root, result) => {
        if (
            !validateOptions(result, ruleName, {
                actual: primary,
                possible: [true],
            })
        ) {
            return;
        }

        root.walkRules((ruleNode) => {
            const declarations = getDirectDeclarations(ruleNode);
            const displayDeclaration = getLastLiteralDisplay(declarations);
            const displayValue = isDefined(displayDeclaration)
                ? getLiteralDisplayValue(displayDeclaration.value)
                : undefined;
            const isGridCapableDisplay = isDefined(displayValue)
                ? setHas(gridDisplayValues, displayValue)
                : false;
            const isKnownNonGridDisplay = isDefined(displayValue)
                ? setHas(nonGridDisplayValues, displayValue)
                : false;

            if (
                !isDefined(displayValue) ||
                isGridCapableDisplay ||
                !isKnownNonGridDisplay
            ) {
                return;
            }

            for (const declaration of declarations) {
                const propertyName = declaration.prop.toLowerCase();

                if (setHas(gridContainerProperties, propertyName)) {
                    report({
                        message: messages.rejected(propertyName, displayValue),
                        node: declaration,
                        result,
                        ruleName,
                        word: declaration.prop,
                    });
                }
            }
        });
    };

/** Public Stylelint rule definition. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
