import stylelint, { type RuleBase } from "stylelint";
import { setHas } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import { splitTopLevelWhitespace } from "../_internal/grid-template-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("prefer-minmax-zero-fr");
const messages: { rejected: (track: string) => string } = ruleMessages(
    ruleName,
    {
        rejected: (track: string): string =>
            `Wrap bare flexible column track \`${track}\` in \`minmax(0, ${track})\` to avoid content-driven overflow.`,
    }
);

const docs = {
    description:
        "Prefer `minmax(0, <flex>)` for bare flexible CSS Grid column tracks.",
    recommended: false,
    url: createRuleDocsUrl("prefer-minmax-zero-fr"),
} as const;

const ignoredTrackKeywords: ReadonlySet<string> = new Set([
    "masonry",
    "none",
    "subgrid",
]);

const flexTrackPattern = /^\+?(?:\d+|\d*\.\d+)fr$/v;

function isBareFlexibleTrack(token: string): boolean {
    const normalizedToken = token.toLowerCase();

    return (
        !setHas(ignoredTrackKeywords, normalizedToken) &&
        flexTrackPattern.test(normalizedToken)
    );
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

        root.walkDecls("grid-template-columns", (declaration) => {
            for (const token of splitTopLevelWhitespace(declaration.value)) {
                if (isBareFlexibleTrack(token)) {
                    report({
                        message: messages.rejected(token),
                        node: declaration,
                        result,
                        ruleName,
                        word: token,
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
