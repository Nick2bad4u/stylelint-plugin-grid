import type { ArrayElement } from "type-fest";

import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import { collectGridAreaUsages } from "../_internal/grid-template-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("no-overlapping-areas");
const messages: {
    rejected: (areaName: string, firstSelector: string) => string;
} = ruleMessages(ruleName, {
    rejected: (areaName: string, firstSelector: string): string =>
        `Grid area "${areaName}" is assigned by more than one selector; it may overlap the earlier "${firstSelector}" item at runtime.`,
});

const docs = {
    description:
        "Disallow multiple selectors assigning the same single-name `grid-area` value in one stylesheet.",
    recommended: false,
    url: createRuleDocsUrl("no-overlapping-areas"),
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

        const firstUsageByName = new Map<
            string,
            ArrayElement<ReturnType<typeof collectGridAreaUsages>>
        >();

        for (const usage of collectGridAreaUsages(root)) {
            const firstUsage = firstUsageByName.get(usage.name);

            if (isDefined(firstUsage)) {
                report({
                    message: messages.rejected(
                        usage.name,
                        firstUsage.selector ?? firstUsage.name
                    ),
                    node: usage.declaration,
                    result,
                    ruleName,
                    word: usage.name,
                });
            } else {
                firstUsageByName.set(usage.name, usage);
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
