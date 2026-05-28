import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import {
    findSiblingDeclaration,
    splitTopLevelWhitespace,
} from "../_internal/grid-template-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("require-explicit-rows-with-column-flow");
const messages: { rejected: () => string } = ruleMessages(ruleName, {
    rejected: (): string =>
        "Pair `grid-auto-flow: column` with explicit row sizing in the same block, such as `grid-template-rows` or `grid-auto-rows`.",
});

const docs = {
    description:
        "Require explicit row sizing when a rule uses `grid-auto-flow: column`.",
    recommended: false,
    url: createRuleDocsUrl("require-explicit-rows-with-column-flow"),
} as const;

function hasColumnFlow(value: string): boolean {
    return splitTopLevelWhitespace(value).some(
        (token) => token.toLowerCase() === "column"
    );
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

        root.walkDecls("grid-auto-flow", (declaration) => {
            if (!hasColumnFlow(declaration.value)) {
                return;
            }

            const hasExplicitRows =
                isDefined(
                    findSiblingDeclaration(declaration, "grid-template-rows")
                ) ||
                isDefined(
                    findSiblingDeclaration(declaration, "grid-auto-rows")
                );

            if (hasExplicitRows) {
                return;
            }

            report({
                message: messages.rejected(),
                node: declaration,
                result,
                ruleName,
                word: "column",
            });
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
