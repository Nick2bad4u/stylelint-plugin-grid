import stylelint, { type RuleBase } from "stylelint";
import { isDefined, isEmpty } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import {
    collectGridTemplateAreas,
    countGridTracks,
    findSiblingDeclaration,
} from "../_internal/grid-template-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("no-mismatched-template-rows");
const messages: {
    rejected: (areaRows: number, trackRows: number) => string;
} = ruleMessages(ruleName, {
    rejected: (areaRows: number, trackRows: number): string =>
        `\`grid-template-areas\` defines ${String(areaRows)} rows, but sibling \`grid-template-rows\` defines ${String(trackRows)} tracks.`,
});

const docs = {
    description:
        "Require `grid-template-rows` track count to match `grid-template-areas` row count.",
    recommended: true,
    url: createRuleDocsUrl("no-mismatched-template-rows"),
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
                const rowsDeclaration = findSiblingDeclaration(
                    template.declaration,
                    "grid-template-rows"
                );
                const trackRows = isDefined(rowsDeclaration)
                    ? countGridTracks(rowsDeclaration.value)
                    : undefined;

                if (
                    isDefined(rowsDeclaration) &&
                    isDefined(trackRows) &&
                    trackRows !== template.rows.length
                ) {
                    report({
                        message: messages.rejected(
                            template.rows.length,
                            trackRows
                        ),
                        node: rowsDeclaration,
                        result,
                        ruleName,
                    });
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
