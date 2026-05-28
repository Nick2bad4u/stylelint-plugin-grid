import stylelint, { type RuleBase } from "stylelint";
import { isEmpty, setHas } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import {
    collectGridAreaUsages,
    collectGridTemplateAreas,
} from "../_internal/grid-template-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("no-unused-areas");
const messages: { rejected: (areaName: string) => string } = ruleMessages(
    ruleName,
    {
        rejected: (areaName: string): string =>
            `Grid template area "${areaName}" is declared but no single-name \`grid-area: ${areaName}\` declaration exists in this stylesheet.`,
    }
);

const docs = {
    description:
        "Disallow named template areas that are never referenced by a single-name `grid-area` declaration in the same stylesheet.",
    recommended: false,
    url: createRuleDocsUrl("no-unused-areas"),
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

        const usedAreaNames = new Set(
            collectGridAreaUsages(root).map((usage) => usage.name)
        );

        for (const template of collectGridTemplateAreas(root)) {
            if (isEmpty(template.diagnostics)) {
                for (const areaName of template.areaNames) {
                    if (!setHas(usedAreaNames, areaName)) {
                        report({
                            message: messages.rejected(areaName),
                            node: template.declaration,
                            result,
                            ruleName,
                            word: areaName,
                        });
                    }
                }
            }
        }
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
