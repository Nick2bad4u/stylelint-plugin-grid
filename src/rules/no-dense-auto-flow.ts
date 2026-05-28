import stylelint, { type RuleBase } from "stylelint";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import { splitTopLevelWhitespace } from "../_internal/grid-template-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("no-dense-auto-flow");
const messages: { rejected: () => string } = ruleMessages(ruleName, {
    rejected: (): string =>
        "Avoid `grid-auto-flow: dense`; dense packing can disconnect visual order from source order.",
});

const docs = {
    description:
        "Disallow `grid-auto-flow: dense` because it can reorder auto-placed grid items visually.",
    recommended: false,
    url: createRuleDocsUrl("no-dense-auto-flow"),
} as const;

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
            const hasDensePacking = splitTopLevelWhitespace(
                declaration.value
            ).some((token) => token.toLowerCase() === "dense");

            if (!hasDensePacking) {
                return;
            }

            report({
                message: messages.rejected(),
                node: declaration,
                result,
                ruleName,
                word: "dense",
            });
        });
    };

const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
