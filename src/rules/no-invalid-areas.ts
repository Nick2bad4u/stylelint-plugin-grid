import stylelint, { type RuleBase } from "stylelint";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import { collectGridTemplateAreas } from "../_internal/grid-template-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("no-invalid-areas");
const messages: { rejected: (message: string) => string } = ruleMessages(
    ruleName,
    {
        rejected: (message: string): string => message,
    }
);

const docs = {
    description: "Disallow malformed `grid-template-areas` declarations.",
    recommended: true,
    url: createRuleDocsUrl("no-invalid-areas"),
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

        for (const template of collectGridTemplateAreas(root)) {
            for (const diagnostic of template.diagnostics) {
                report({
                    message: messages.rejected(diagnostic.message),
                    node: template.declaration,
                    result,
                    ruleName,
                    word: diagnostic.token,
                });
            }
        }
    };

const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
