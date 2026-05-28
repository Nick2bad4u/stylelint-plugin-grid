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

const ruleName = createRuleName("no-invalid-minmax");
const messages: { rejected: (minimum: string) => string } = ruleMessages(
    ruleName,
    {
        rejected: (minimum: string): string =>
            `Do not use flexible track breadth \`${minimum}\` as the minimum in \`minmax()\`; use an inflexible minimum such as \`0\`, a length, or a percentage.`,
    }
);

const docs = {
    description:
        "Disallow flexible `fr` values as the minimum argument in CSS Grid `minmax()` track sizes.",
    recommended: true,
    url: createRuleDocsUrl("no-invalid-minmax"),
} as const;

const gridTrackProperties: ReadonlySet<string> = new Set([
    "grid-auto-columns",
    "grid-auto-rows",
    "grid-template-columns",
    "grid-template-rows",
]);

function isFlexTrackBreadth(value: string): boolean {
    return /^[+\-]?(?:\d+|\d*\.\d+)fr$/v.test(value.toLowerCase());
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
            if (!setHas(gridTrackProperties, declaration.prop.toLowerCase())) {
                return;
            }

            for (const minmaxCall of findValueFunctionCalls(
                declaration.value,
                "minmax"
            )) {
                const minimum = arrayFirst(
                    splitTopLevelCommas(minmaxCall.body)
                )?.trim();

                if (isDefined(minimum) && isFlexTrackBreadth(minimum)) {
                    report({
                        message: messages.rejected(minimum),
                        node: declaration,
                        result,
                        ruleName,
                        word: minimum,
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
