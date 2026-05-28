import nick2bad4u from "eslint-config-nick2bad4u";

/** @type {import("eslint").Linter.Config[]} */
const config = [
    ...nick2bad4u.configs.withoutStylelint2,

    {
        ignores: ["docs/docusaurus/typedoc-plugins/**"],
    },

    {
        files: ["**/*.{ts,tsx,cts,mts}"],
        rules: {
            "no-use-before-define": [
                "error",
                {
                    allowNamedExports: false,
                    classes: true,
                    functions: false,
                    variables: true,
                },
            ],
        },
    },

    {
        files: ["src/_internal/grid-template-analysis.ts", "src/rules/**/*.ts"],
        rules: {
            "@typescript-eslint/prefer-readonly-parameter-types": "off",
        },
    },

    {
        files: ["docs/docusaurus/src/pages/index.tsx"],
        rules: {
            "canonical/filename-no-index": "off",
        },
    },

    {
        files: ["docs/docusaurus/src/**/*.{ts,tsx}"],
        rules: {
            "import-x/no-unresolved": "off",
        },
    },

    {
        files: ["test/**/*.{ts,tsx}"],
        rules: {
            "@typescript-eslint/prefer-readonly-parameter-types": "off",
            "vitest/prefer-to-be-falsy": "off",
            "vitest/prefer-to-be-truthy": "off",
        },
    },

    // Add repository-specific config entries below as needed.
];

export default config;
