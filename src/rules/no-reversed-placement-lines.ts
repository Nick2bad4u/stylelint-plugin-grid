import stylelint, { type RuleBase } from "stylelint";
import { arrayAt, arrayFirst, isDefined, setHas } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import {
    getDirectDeclarations,
    getGridPlacementSlots,
    parseStandaloneGridLineInteger,
} from "../_internal/grid-placement-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("no-reversed-placement-lines");
const messages: {
    rejected: (propertyName: string, start: number, end: number) => string;
} = ruleMessages(ruleName, {
    rejected: (propertyName: string, start: number, end: number): string =>
        `Use an end line after the start line for \`${propertyName}\`; \`${String(end)}\` is not after \`${String(start)}\`.`,
});

const docs = {
    description:
        "Disallow reversed or zero-width numeric CSS Grid placement line ranges.",
    recommended: true,
    url: createRuleDocsUrl("no-reversed-placement-lines"),
} as const;

const shorthandProperties: ReadonlySet<string> = new Set([
    "grid-column",
    "grid-row",
]);

const gridAreaPropertyName = "grid-area";

type PlacementLonghandPair = Readonly<{
    end: string;
    name: string;
    start: string;
}>;

const longhandPairs: readonly PlacementLonghandPair[] = [
    {
        end: "grid-column-end",
        name: "grid-column",
        start: "grid-column-start",
    },
    {
        end: "grid-row-end",
        name: "grid-row",
        start: "grid-row-start",
    },
];

function getComparableLinePair(
    startValue: string,
    endValue: string
): readonly [start: number, end: number] | undefined {
    const start = parseStandaloneGridLineInteger(startValue);
    const end = parseStandaloneGridLineInteger(endValue);

    if (!isDefined(start) || !isDefined(end) || start === 0 || end === 0) {
        return undefined;
    }

    if (Math.sign(start) !== Math.sign(end)) {
        return undefined;
    }

    return [start, end];
}

function isReversedOrZeroWidth(
    pair: readonly [start: number, end: number]
): boolean {
    const [start, end] = pair;

    return end <= start;
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
            const propertyName = declaration.prop.toLowerCase();

            if (
                !setHas(shorthandProperties, propertyName) &&
                propertyName !== gridAreaPropertyName
            ) {
                return;
            }

            const slots = getGridPlacementSlots(declaration.value);
            const shorthandPairs =
                propertyName === gridAreaPropertyName
                    ? [
                          {
                              endValue: arrayAt(slots, 2),
                              propertyName: "grid-row",
                              startValue: arrayFirst(slots),
                          },
                          {
                              endValue: arrayAt(slots, 3),
                              propertyName: "grid-column",
                              startValue: arrayAt(slots, 1),
                          },
                      ]
                    : [
                          {
                              endValue: arrayAt(slots, 1),
                              propertyName,
                              startValue: arrayFirst(slots),
                          },
                      ];

            for (const shorthandPair of shorthandPairs) {
                const {
                    endValue,
                    propertyName: pairName,
                    startValue,
                } = shorthandPair;

                if (isDefined(startValue) && isDefined(endValue)) {
                    const pair = getComparableLinePair(startValue, endValue);

                    if (isDefined(pair) && isReversedOrZeroWidth(pair)) {
                        const [start, end] = pair;

                        report({
                            message: messages.rejected(pairName, start, end),
                            node: declaration,
                            result,
                            ruleName,
                            word: endValue,
                        });
                    }
                }
            }
        });

        root.walkRules((ruleNode) => {
            const declarations = getDirectDeclarations(ruleNode);

            for (const pair of longhandPairs) {
                const startDeclaration = declarations.find(
                    (declaration) =>
                        declaration.prop.toLowerCase() === pair.start
                );
                const endDeclaration = declarations.find(
                    (declaration) => declaration.prop.toLowerCase() === pair.end
                );

                if (isDefined(startDeclaration) && isDefined(endDeclaration)) {
                    const linePair = getComparableLinePair(
                        startDeclaration.value,
                        endDeclaration.value
                    );

                    if (
                        isDefined(linePair) &&
                        isReversedOrZeroWidth(linePair)
                    ) {
                        const [start, end] = linePair;

                        report({
                            message: messages.rejected(pair.name, start, end),
                            node: endDeclaration,
                            result,
                            ruleName,
                            word: endDeclaration.value,
                        });
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
