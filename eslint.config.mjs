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

    // Add repository-specific config entries below as needed.
];

export default config;
