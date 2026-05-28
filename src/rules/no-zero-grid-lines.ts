import stylelint, { type RuleBase } from "stylelint";
import { arrayIncludes } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import {
    getGridLineIntegerTokens,
    getGridPlacementSlots,
    isGridPlacementDeclaration,
} from "../_internal/grid-placement-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("no-zero-grid-lines");
const messages: { rejected: () => string } = ruleMessages(ruleName, {
    rejected: (): string =>
        "Do not use Grid line `0`; CSS Grid line numbering starts at `1` and `-1`.",
});

const docs = {
    description: "Disallow line `0` in CSS Grid placement declarations.",
    recommended: true,
    url: createRuleDocsUrl("no-zero-grid-lines"),
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
                if (arrayIncludes(getGridLineIntegerTokens(slot), 0)) {
                    report({
                        message: messages.rejected(),
                        node: declaration,
                        result,
                        ruleName,
                        word: "0",
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
