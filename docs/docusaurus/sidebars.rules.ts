import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

/** Rule and config docs sidebar for the Stylelint plugin docs section. */
const sidebars: SidebarsConfig = {
    rules: [
        {
            className: "sb-doc-overview",
            id: "overview",
            label: "Overview",
            type: "doc",
        },
        {
            className: "sb-doc-getting-started",
            id: "getting-started",
            label: "Getting Started",
            type: "doc",
        },
        {
            className: "sb-cat-configs",
            collapsed: false,
            customProps: {
                badge: "configs",
            },
            items: [
                {
                    className: "sb-config-all",
                    id: "configs/grid-all",
                    label: "grid-all",
                    type: "doc",
                },
                {
                    className: "sb-config-recommended",
                    id: "configs/grid-recommended",
                    label: "grid-recommended",
                    type: "doc",
                },
            ],
            label: "Configs",
            link: {
                id: "configs/index",
                type: "doc",
            },
            type: "category",
        },
        {
            className: "sb-cat-guides",
            collapsed: false,
            customProps: {
                badge: "guides",
            },
            items: [
                {
                    id: "guides/current-status",
                    label: "Current Status",
                    type: "doc",
                },
            ],
            label: "Guides",
            link: {
                description:
                    "Current scope and static-analysis boundaries for the CSS Grid rule catalog.",
                title: "Guides",
                type: "generated-index",
            },
            type: "category",
        },
        {
            className: "sb-cat-rules",
            collapsed: false,
            customProps: {
                badge: "rules",
            },
            items: [
                {
                    className: "sb-rule-consistent-area-naming",
                    id: "consistent-area-naming",
                    label: "consistent-area-naming",
                    type: "doc",
                },
                {
                    className: "sb-rule-no-dense-auto-flow",
                    id: "no-dense-auto-flow",
                    label: "no-dense-auto-flow",
                    type: "doc",
                },
                {
                    className: "sb-rule-no-invalid-auto-repeat",
                    id: "no-invalid-auto-repeat",
                    label: "no-invalid-auto-repeat",
                    type: "doc",
                },
                {
                    className: "sb-rule-no-invalid-areas",
                    id: "no-invalid-areas",
                    label: "no-invalid-areas",
                    type: "doc",
                },
                {
                    className: "sb-rule-no-invalid-minmax",
                    id: "no-invalid-minmax",
                    label: "no-invalid-minmax",
                    type: "doc",
                },
                {
                    className: "sb-rule-no-mismatched-template-rows",
                    id: "no-mismatched-template-rows",
                    label: "no-mismatched-template-rows",
                    type: "doc",
                },
                {
                    className: "sb-rule-no-overlapping-areas",
                    id: "no-overlapping-areas",
                    label: "no-overlapping-areas",
                    type: "doc",
                },
                {
                    className: "sb-rule-no-unknown-areas",
                    id: "no-unknown-areas",
                    label: "no-unknown-areas",
                    type: "doc",
                },
                {
                    className: "sb-rule-no-unused-areas",
                    id: "no-unused-areas",
                    label: "no-unused-areas",
                    type: "doc",
                },
                {
                    className: "sb-rule-prefer-gap-properties",
                    id: "prefer-gap-properties",
                    label: "prefer-gap-properties",
                    type: "doc",
                },
                {
                    className: "sb-rule-require-explicit-rows-with-column-flow",
                    id: "require-explicit-rows-with-column-flow",
                    label: "require-explicit-rows-with-column-flow",
                    type: "doc",
                },
                {
                    className: "sb-rule-validate-area-shapes",
                    id: "validate-area-shapes",
                    label: "validate-area-shapes",
                    type: "doc",
                },
                {
                    className: "sb-rule-validate-track-counts",
                    id: "validate-track-counts",
                    label: "validate-track-counts",
                    type: "doc",
                },
            ],
            label: "Rules",
            link: {
                description:
                    "Reference documentation for the public CSS Grid Stylelint rule catalog in this package.",
                title: "Rules",
                type: "generated-index",
            },
            type: "category",
        },
    ],
} satisfies SidebarsConfig;

export default sidebars;
