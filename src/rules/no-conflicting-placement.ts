import type { Declaration } from "postcss";

import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import {
    getDirectDeclarations,
    isGridPlacementDeclaration,
} from "../_internal/grid-placement-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("no-conflicting-placement");
const messages: {
    rejected: (propertyName: string, previousPropertyName: string) => string;
} = ruleMessages(ruleName, {
    rejected: (propertyName: string, previousPropertyName: string): string =>
        `Avoid conflicting Grid placement declarations; \`${propertyName}\` writes the same placement slot as earlier \`${previousPropertyName}\` in this block.`,
});

const docs = {
    description:
        "Disallow same-block CSS Grid placement declarations that write the same placement slot.",
    recommended: true,
    url: createRuleDocsUrl("no-conflicting-placement"),
} as const;

type PlacementSlot = "column-end" | "column-start" | "row-end" | "row-start";

const propertySlots: Readonly<Record<string, readonly PlacementSlot[]>> = {
    "grid-area": [
        "row-start",
        "column-start",
        "row-end",
        "column-end",
    ],
    "grid-column": ["column-start", "column-end"],
    "grid-column-end": ["column-end"],
    "grid-column-start": ["column-start"],
    "grid-row": ["row-start", "row-end"],
    "grid-row-end": ["row-end"],
    "grid-row-start": ["row-start"],
};

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

        root.walkRules((ruleNode) => {
            const slotDeclarations = new Map<PlacementSlot, Declaration>();

            for (const declaration of getDirectDeclarations(ruleNode)) {
                if (isGridPlacementDeclaration(declaration)) {
                    const propertyName = declaration.prop.toLowerCase();
                    const slots = propertySlots[propertyName] ?? [];
                    const previousDeclaration = slots
                        .map((slot) => slotDeclarations.get(slot))
                        .find(isDefined);

                    if (isDefined(previousDeclaration)) {
                        report({
                            message: messages.rejected(
                                propertyName,
                                previousDeclaration.prop
                            ),
                            node: declaration,
                            result,
                            ruleName,
                            word: declaration.prop,
                        });
                    }

                    for (const slot of slots) {
                        slotDeclarations.set(slot, declaration);
                    }
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
