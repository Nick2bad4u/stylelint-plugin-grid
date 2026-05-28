import stylelint, { type RuleBase } from "stylelint";
import { isEmpty } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import {
    collectGridTemplateAreas,
    getAreaShapes,
    isRectangularArea,
} from "../_internal/grid-template-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("validate-area-shapes");
const messages: { rejected: (areaName: string) => string } = ruleMessages(
    ruleName,
    {
        rejected: (areaName: string): string =>
            `Grid area "${areaName}" must form one contiguous rectangle in \`grid-template-areas\`.`,
    }
);

const docs = {
    description:
        "Require every named grid template area to form one contiguous rectangle.",
    recommended: true,
    url: createRuleDocsUrl("validate-area-shapes"),
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
            if (isEmpty(template.diagnostics)) {
                for (const shape of getAreaShapes(template)) {
                    if (!isRectangularArea(template, shape)) {
                        report({
                            message: messages.rejected(shape.name),
                            node: template.declaration,
                            result,
                            ruleName,
                            word: shape.name,
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
