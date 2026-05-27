import type { Declaration } from "postcss";

import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("prefer-gap-properties");
const messages: {
    rejected: (propertyName: string, replacement: string) => string;
} = ruleMessages(ruleName, {
    rejected: (propertyName: string, replacement: string): string =>
        `Prefer \`${replacement}\` over legacy \`${propertyName}\`.`,
});

const docs = {
    description:
        "Prefer modern `gap`, `row-gap`, and `column-gap` properties over legacy grid gap aliases.",
    recommended: true,
    url: createRuleDocsUrl("prefer-gap-properties"),
} as const;

const replacements: Readonly<Record<string, string>> = {
    "grid-column-gap": "column-gap",
    "grid-gap": "gap",
    "grid-row-gap": "row-gap",
};

function getReplacement(
    declaration: Readonly<Declaration>
): string | undefined {
    return replacements[declaration.prop.toLowerCase()];
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

        root.walkDecls((declaration) => {
            const replacement = getReplacement(declaration);

            if (!isDefined(replacement)) {
                return;
            }

            report({
                fix: () => {
                    declaration.prop = replacement;
                },
                message: messages.rejected(declaration.prop, replacement),
                node: declaration,
                result,
                ruleName,
                word: declaration.prop,
            });
        });
    };

const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        meta: {
            fixable: true,
        },
        rule: ruleFunction,
        ruleName,
    });

export default rule;
