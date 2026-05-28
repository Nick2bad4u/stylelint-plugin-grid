import stylelint, { type RuleBase } from "stylelint";
import { arrayFirst, isDefined, setHas } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import {
    findValueFunctionCalls,
    splitTopLevelCommas,
    splitTopLevelWhitespace,
} from "../_internal/grid-template-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("no-invalid-auto-repeat");
const messages: {
    rejected: (token: string, repeatKeyword: string) => string;
} = ruleMessages(ruleName, {
    rejected: (token: string, repeatKeyword: string): string =>
        `Use a fixed track size inside \`repeat(${repeatKeyword}, ...)\`; \`${token}\` can make the grid template declaration invalid.`,
});

const docs = {
    description:
        "Disallow definitely invalid CSS Grid auto-repeat track sizes.",
    recommended: true,
    url: createRuleDocsUrl("no-invalid-auto-repeat"),
} as const;

const trackTemplateProperties: ReadonlySet<string> = new Set([
    "grid-template-columns",
    "grid-template-rows",
]);

const invalidBareAutoRepeatTrackTokens: ReadonlySet<string> = new Set([
    "auto",
    "max-content",
    "min-content",
]);

const cssLengthUnits: ReadonlySet<string> = new Set([
    "cap",
    "ch",
    "cm",
    "dvb",
    "dvh",
    "dvi",
    "dvmax",
    "dvmin",
    "dvw",
    "em",
    "ex",
    "ic",
    "in",
    "lh",
    "lvb",
    "lvh",
    "lvi",
    "lvmax",
    "lvmin",
    "lvw",
    "mm",
    "pc",
    "pt",
    "px",
    "q",
    "rch",
    "rem",
    "rex",
    "ric",
    "rlh",
    "svb",
    "svh",
    "svi",
    "svmax",
    "svmin",
    "svw",
    "vb",
    "vh",
    "vi",
    "vmax",
    "vmin",
    "vw",
]);

const lengthPercentagePattern = /^[+\-]?(?:\d+|\d*\.\d+)(?<unit>%|[A-Za-z]+)$/v;
const zeroPattern = /^[+\-]?(?:0|0?\.0+)$/v;

function containsRuntimeValue(token: string): boolean {
    const normalizedToken = token.toLowerCase();

    return normalizedToken.includes("var(") || normalizedToken.includes("env(");
}

function getInvalidAutoRepeatTrack(trackList: string): string | undefined {
    for (const token of splitTopLevelWhitespace(trackList)) {
        const normalizedToken = token.toLowerCase();

        if (!isLineNameList(token) && !containsRuntimeValue(token)) {
            if (
                setHas(invalidBareAutoRepeatTrackTokens, normalizedToken) ||
                isFlexTrackBreadth(normalizedToken)
            ) {
                return token;
            }

            if (
                hasStringPrefix(normalizedToken, "minmax(") &&
                isInvalidAutoRepeatMinmax(token)
            ) {
                return token;
            }
        }
    }

    return undefined;
}

function getMinmaxArguments(
    token: string
): readonly [minimum: string, maximum: string] | undefined {
    const minmaxCall = arrayFirst(findValueFunctionCalls(token, "minmax"));

    if (!isDefined(minmaxCall)) {
        return undefined;
    }

    const [minimum, maximum] = splitTopLevelCommas(minmaxCall.body).map(
        (argument) => argument.trim()
    );

    if (!isDefined(minimum) || !isDefined(maximum)) {
        return undefined;
    }

    return [minimum, maximum];
}

function getRepeatKeyword(
    repeatBody: string
): "auto-fill" | "auto-fit" | undefined {
    const repeatCount = arrayFirst(splitTopLevelCommas(repeatBody))
        ?.trim()
        .toLowerCase();

    if (repeatCount === "auto-fill" || repeatCount === "auto-fit") {
        return repeatCount;
    }

    return undefined;
}

function hasStringPrefix(value: string, prefix: string): boolean {
    // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with -- `startsWith` is falsely flagged as unsafe in this typed lint context.
    return value.slice(0, prefix.length) === prefix;
}

function isFixedTrackBreadth(value: string): boolean {
    const normalizedValue = value.toLowerCase();

    if (zeroPattern.test(normalizedValue)) {
        return true;
    }

    if (
        hasStringPrefix(normalizedValue, "calc(") ||
        hasStringPrefix(normalizedValue, "clamp(") ||
        hasStringPrefix(normalizedValue, "max(") ||
        hasStringPrefix(normalizedValue, "min(")
    ) {
        return true;
    }

    const match = lengthPercentagePattern.exec(normalizedValue);
    const unit = match?.groups?.["unit"];

    return unit === "%" || (isDefined(unit) && setHas(cssLengthUnits, unit));
}

function isFlexTrackBreadth(value: string): boolean {
    return /^[+\-]?(?:\d+|\d*\.\d+)fr$/v.test(value);
}

function isIntrinsicTrackBreadth(value: string): boolean {
    const normalizedValue = value.toLowerCase();

    return setHas(invalidBareAutoRepeatTrackTokens, normalizedValue);
}

function isInvalidAutoRepeatMinmax(token: string): boolean {
    const args = getMinmaxArguments(token);

    if (!isDefined(args)) {
        return false;
    }

    const [minimum, maximum] = args;

    return (
        isFlexTrackBreadth(minimum) ||
        (isIntrinsicTrackBreadth(minimum) && !isFixedTrackBreadth(maximum))
    );
}

function isLineNameList(token: string): boolean {
    return token.startsWith("[") && token.endsWith("]");
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
                const repeatKeyword = getRepeatKeyword(repeatCall.body);

                if (isDefined(repeatKeyword)) {
                    // eslint-disable-next-line typefest/prefer-ts-extras-array-join -- ts-extras does not expose a typed arrayJoin in this project setup.
                    const trackList = splitTopLevelCommas(repeatCall.body)
                        .slice(1)
                        .join(",");
                    const invalidTrack = getInvalidAutoRepeatTrack(trackList);

                    if (isDefined(invalidTrack)) {
                        report({
                            message: messages.rejected(
                                invalidTrack,
                                repeatKeyword
                            ),
                            node: declaration,
                            result,
                            ruleName,
                            word: invalidTrack,
                        });
                    }
                }
            }
        });
    };

const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
