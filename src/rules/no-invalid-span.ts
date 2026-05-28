import stylelint, { type RuleBase } from "stylelint";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import {
    getGridLineSpanCounts,
    getGridPlacementSlots,
    isGridPlacementDeclaration,
} from "../_internal/grid-placement-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("no-invalid-span");
const messages: { rejected: (span: number) => string } = ruleMessages(
    ruleName,
    {
        rejected: (span: number): string =>
            `Use a positive Grid span count; \`span ${String(span)}\` cannot place a grid item.`,
    }
);

const docs = {
    description:
        "Disallow non-positive `span` counts in CSS Grid placement declarations.",
    recommended: true,
    url: createRuleDocsUrl("no-invalid-span"),
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

        root.walkDecls((declaration) => {
            if (!isGridPlacementDeclaration(declaration)) {
                return;
            }

            for (const slot of getGridPlacementSlots(declaration.value)) {
                for (const span of getGridLineSpanCounts(slot)) {
                    if (span <= 0) {
                        report({
                            message: messages.rejected(span),
                            node: declaration,
                            result,
                            ruleName,
                            word: String(span),
                        });
                    }
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
