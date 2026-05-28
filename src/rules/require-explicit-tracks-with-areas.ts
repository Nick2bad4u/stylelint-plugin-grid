import stylelint, { type RuleBase } from "stylelint";
import { isEmpty } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import {
    collectGridTemplateAreas,
    findSiblingDeclaration,
} from "../_internal/grid-template-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("require-explicit-tracks-with-areas");

type SecondaryOptions = Readonly<{
    columns?: boolean;
    rows?: boolean;
}>;

const messages: { rejected: (propertyName: string) => string } = ruleMessages(
    ruleName,
    {
        rejected: (propertyName: string): string =>
            `Pair \`grid-template-areas\` with \`${propertyName}\` in the same block so named areas have explicit track sizing.`,
    }
);

const docs = {
    description:
        "Require explicit track sizing alongside CSS Grid named area templates.",
    recommended: false,
    url: createRuleDocsUrl("require-explicit-tracks-with-areas"),
} as const;

const ruleFunction: RuleBase<boolean, SecondaryOptions | undefined> =
    (primary, secondary) => (root, result) => {
        if (
            !validateOptions(
                result,
                ruleName,
                {
                    actual: primary,
                    possible: [true],
                },
                {
                    actual: secondary,
                    optional: true,
                    possible: {
                        columns: [true, false],
                        rows: [true, false],
                    },
                }
            )
        ) {
            return;
        }

        const requireColumns = secondary?.columns ?? true;
        const requireRows = secondary?.rows ?? false;

        for (const template of collectGridTemplateAreas(root)) {
            if (isEmpty(template.diagnostics)) {
                if (
                    requireColumns &&
                    !findSiblingDeclaration(
                        template.declaration,
                        "grid-template-columns"
                    )
                ) {
                    report({
                        message: messages.rejected("grid-template-columns"),
                        node: template.declaration,
                        result,
                        ruleName,
                        word: template.declaration.prop,
                    });
                }

                if (
                    requireRows &&
                    !findSiblingDeclaration(
                        template.declaration,
                        "grid-template-rows"
                    )
                ) {
                    report({
                        message: messages.rejected("grid-template-rows"),
                        node: template.declaration,
                        result,
                        ruleName,
                        word: template.declaration.prop,
                    });
                }
            }
        }
    };

/** Public Stylelint rule definition. */
const rule: StylelintPluginRule<
    boolean,
    SecondaryOptions | undefined,
    typeof messages
> = createStylelintRule<boolean, SecondaryOptions | undefined, typeof messages>(
    {
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    }
);

export default rule;
