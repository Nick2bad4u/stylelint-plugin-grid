import stylelint, { type RuleBase } from "stylelint";
import { arrayFirst, isDefined, isEmpty } from "ts-extras";

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

const ruleName = createRuleName("validate-track-counts");
const messages: {
    columns: (areaColumns: number, trackColumns: number) => string;
    rows: (areaRows: number, trackRows: number) => string;
} = ruleMessages(ruleName, {
    columns: (areaColumns: number, trackColumns: number): string =>
        `\`grid-template-areas\` defines ${String(areaColumns)} columns, but sibling \`grid-template-columns\` defines ${String(trackColumns)} tracks.`,
    rows: (areaRows: number, trackRows: number): string =>
        `\`grid-template-areas\` defines ${String(areaRows)} rows, but sibling \`grid-template-rows\` defines ${String(trackRows)} tracks.`,
});

const docs = {
    description:
        "Require template row and column track counts to match `grid-template-areas` dimensions.",
    recommended: true,
    url: createRuleDocsUrl("validate-track-counts"),
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
            const expectedColumns = arrayFirst(template.rows)?.length;

            if (isEmpty(template.diagnostics) && isDefined(expectedColumns)) {
                const expectedRows = template.rows.length;
                const rowsDeclaration = findSiblingDeclaration(
                    template.declaration,
                    "grid-template-rows"
                );
                const columnsDeclaration = findSiblingDeclaration(
                    template.declaration,
                    "grid-template-columns"
                );
                const actualRows = isDefined(rowsDeclaration)
                    ? countGridTracks(rowsDeclaration.value)
                    : undefined;
                const actualColumns = isDefined(columnsDeclaration)
                    ? countGridTracks(columnsDeclaration.value)
                    : undefined;

                if (
                    isDefined(rowsDeclaration) &&
                    isDefined(actualRows) &&
                    actualRows !== expectedRows
                ) {
                    report({
                        message: messages.rows(expectedRows, actualRows),
                        node: rowsDeclaration,
                        result,
                        ruleName,
                    });
                }

                if (
                    isDefined(columnsDeclaration) &&
                    isDefined(actualColumns) &&
                    actualColumns !== expectedColumns
                ) {
                    report({
                        message: messages.columns(
                            expectedColumns,
                            actualColumns
                        ),
                        node: columnsDeclaration,
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
