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

const ruleName = createRuleName("no-unknown-areas");
const messages: { rejected: (areaName: string) => string } = ruleMessages(
    ruleName,
    {
        rejected: (areaName: string): string =>
            `Grid area "${areaName}" is referenced by \`grid-area\` but is not declared in any \`grid-template-areas\` template in this stylesheet.`,
    }
);

const docs = {
    description:
        "Disallow single-name `grid-area` references that do not match any named area declared in the same stylesheet.",
    recommended: true,
    url: createRuleDocsUrl("no-unknown-areas"),
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

        const declaredAreaNames = new Set(
            collectGridTemplateAreas(root).flatMap((template) =>
                isEmpty(template.diagnostics) ? template.areaNames : []
            )
        );

        if (declaredAreaNames.size === 0) {
            return;
        }

        for (const usage of collectGridAreaUsages(root)) {
            if (!setHas(declaredAreaNames, usage.name)) {
                report({
                    message: messages.rejected(usage.name),
                    node: usage.declaration,
                    result,
                    ruleName,
                    word: usage.name,
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
