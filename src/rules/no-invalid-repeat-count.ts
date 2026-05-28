import stylelint, { type RuleBase } from "stylelint";
import { arrayFirst, isDefined, setHas } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import {
    findValueFunctionCalls,
    splitTopLevelCommas,
} from "../_internal/grid-template-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("no-invalid-repeat-count");
const messages: { rejected: (count: string) => string } = ruleMessages(
    ruleName,
    {
        rejected: (count: string): string =>
            `Use a positive integer repeat count; \`${count}\` is not a valid fixed \`repeat()\` count.`,
    }
);

const docs = {
    description:
        "Disallow invalid fixed repeat counts in CSS Grid track templates.",
    recommended: true,
    url: createRuleDocsUrl("no-invalid-repeat-count"),
} as const;

const trackTemplateProperties: ReadonlySet<string> = new Set([
    "grid-template-columns",
    "grid-template-rows",
]);

const nonFixedRepeatCounts: ReadonlySet<string> = new Set([
    "auto-fill",
    "auto-fit",
]);

const integerPattern = /^\+?\d+$/v;
const numericPattern = /^[+\-]?(?:\d+|\d*\.\d+)$/v;

function getInvalidRepeatCount(repeatBody: string): string | undefined {
    const count = arrayFirst(splitTopLevelCommas(repeatBody))?.trim();

    if (!isDefined(count)) {
        return undefined;
    }

    const normalizedCount = count.toLowerCase();

    if (setHas(nonFixedRepeatCounts, normalizedCount)) {
        return undefined;
    }

    return numericPattern.test(count) && !isPositiveIntegerToken(count)
        ? count
        : undefined;
}

function isPositiveIntegerToken(value: string): boolean {
    return integerPattern.test(value) && Number.parseInt(value, 10) > 0;
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
            if (
                !setHas(trackTemplateProperties, declaration.prop.toLowerCase())
            ) {
                return;
            }

            for (const repeatCall of findValueFunctionCalls(
                declaration.value,
                "repeat"
            )) {
                const invalidCount = getInvalidRepeatCount(repeatCall.body);

                if (isDefined(invalidCount)) {
                    report({
                        message: messages.rejected(invalidCount),
                        node: declaration,
                        result,
                        ruleName,
                        word: invalidCount,
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
