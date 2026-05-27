import type { Node } from "postcss";

import stylelint, { type PostcssResult, type RuleBase } from "stylelint";
import { isEmpty } from "ts-extras";

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

const ruleName = createRuleName("consistent-area-naming");

type AreaNamingStyle = "camel-case" | "kebab-case" | "snake-case";
type SecondaryOptions = Readonly<{
    style?: AreaNamingStyle;
}>;

const messages: {
    rejected: (areaName: string, style: AreaNamingStyle) => string;
} = ruleMessages(ruleName, {
    rejected: (areaName: string, style: AreaNamingStyle): string =>
        `Grid area name "${areaName}" must use ${style}.`,
});

const docs = {
    description:
        "Require consistent naming for `grid-template-areas` and single-name `grid-area` identifiers.",
    recommended: false,
    url: createRuleDocsUrl("consistent-area-naming"),
} as const;

const patterns: Readonly<Record<AreaNamingStyle, RegExp>> = {
    "camel-case": /^[a-z][0-9A-Za-z]*$/v,
    "kebab-case": /^[a-z][0-9a-z]*(?:-[0-9a-z]+)*$/v,
    "snake-case": /^[a-z][0-9a-z]*(?:_[0-9a-z]+)*$/v,
};

const allowedStyles: AreaNamingStyle[] = [
    "camel-case",
    "kebab-case",
    "snake-case",
];

function reportRejectedAreaName(input: {
    areaName: string;
    node: Node;
    result: PostcssResult;
    style: AreaNamingStyle;
}): void {
    const { areaName, node, result, style } = input;

    report({
        message: messages.rejected(areaName, style),
        node,
        result,
        ruleName,
        word: areaName,
    });
}

const ruleFunction: RuleBase<boolean, SecondaryOptions> =
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
                        style: allowedStyles,
                    },
                }
            )
        ) {
            return;
        }

        const style = secondary?.style ?? "kebab-case";
        const pattern = patterns[style];

        for (const template of collectGridTemplateAreas(root)) {
            if (isEmpty(template.diagnostics)) {
                for (const areaName of template.areaNames) {
                    if (!pattern.test(areaName)) {
                        reportRejectedAreaName({
                            areaName,
                            node: template.declaration,
                            result,
                            style,
                        });
                    }
                }
            }
        }

        for (const usage of collectGridAreaUsages(root)) {
            if (!pattern.test(usage.name)) {
                reportRejectedAreaName({
                    areaName: usage.name,
                    node: usage.declaration,
                    result,
                    style,
                });
            }
        }
    };

const rule: StylelintPluginRule<boolean, SecondaryOptions, typeof messages> =
    createStylelintRule<boolean, SecondaryOptions, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
