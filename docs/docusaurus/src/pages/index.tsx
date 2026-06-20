import type { ReactElement } from "react";

import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Heading from "@theme/Heading";
import Layout from "@theme/Layout";

import GitHubStats from "../components/git-hub-stats";
import { docsCatalogStats } from "../data/docs-catalog";
import styles from "./index.module.css";

interface HeroBadge {
    readonly description: string;
    readonly icon: string;
    readonly label: string;
}

interface HeroStat {
    readonly description: string;
    readonly headline: string;
}

interface HomeCard {
    readonly description: string;
    readonly icon: string;
    readonly title: string;
    readonly to: string;
}

const heroBadges = [
    {
        description:
            "Built around Stylelint's native plugin-pack model and ESM config authoring.",
        icon: "\u{F013}",
        label: "Stylelint-native",
    },
    {
        description:
            "Focused on authored grid templates, named areas, track counts, and safe layout primitives.",
        icon: "\u{F5FD}",
        label: "Grid-aware",
    },
    {
        description:
            "Template-first infrastructure for rules, docs, sync scripts, and tests.",
        icon: "\u{F0AD}",
        label: "Template-ready",
    },
] as const satisfies readonly HeroBadge[];

const shareableConfigIcon = "\u{E690}";
const publicRuleIcon = "\u{F0CA}";

const heroStats = [
    {
        description:
            "Start with a conservative default or opt into the full stable catalog later.",
        headline: `${shareableConfigIcon} ${String(docsCatalogStats.shareableConfigCount)} Shareable Config${docsCatalogStats.shareableConfigCount === 1 ? "" : "s"}`,
    },
    {
        description:
            "The plugin ships focused guardrails for malformed templates, non-rectangular areas, track-count drift, stale area references, and legacy gap aliases.",
        headline: `${publicRuleIcon} ${String(docsCatalogStats.publicRuleCount)} Public Rule${docsCatalogStats.publicRuleCount === 1 ? "" : "s"}`,
    },

    {
        description:
            "Older Stylelint support for users of the previous major version.",
        headline: "\u{F0068} Stylelint 16+",
    },
] as const satisfies readonly HeroStat[];

const overviewButtonIcon = "\u{F071D}";
const compareConfigsButtonIcon = "\u{F1492}";
const heroKickerIcon = "\u{F0AD}";
const heroKickerIcon2 = "\u{F135}";
const homepageDescription =
    "Explore stylelint-plugin-grid documentation, configs, and CSS Grid linting guidance.";
const homepageKeywords =
    "stylelint-plugin-grid, stylelint, css grid, grid-template-areas, css linting, postcss";
const homepageStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    codeRepository: "https://github.com/Nick2bad4u/stylelint-plugin-grid",
    description: homepageDescription,
    image: "https://nick2bad4u.github.io/stylelint-plugin-grid/img/logo.png",
    license:
        "https://github.com/Nick2bad4u/stylelint-plugin-grid/blob/main/LICENSE",
    name: "stylelint-plugin-grid",
    programmingLanguage: "TypeScript",
    runtimePlatform: "Node.js",
    url: "https://nick2bad4u.github.io/stylelint-plugin-grid/",
} as const;
const homepageSocialImageUrl =
    "https://nick2bad4u.github.io/stylelint-plugin-grid/img/logo.png";

const homeCards = [
    {
        description:
            "Compare the exported configs and understand why `recommended` stays conservative while `all` adds stricter opt-in rules.",
        icon: "\u{E690}",
        title: "Configs",
        to: "/docs/rules/configs",
    },
    {
        description:
            "Install the package, enable a shareable config, and understand the plugin-pack export shape.",
        icon: "\u{F135}",
        title: "Get Started",
        to: "/docs/rules/getting-started",
    },
    {
        description:
            "Read the current rule scope and static-analysis boundaries before enabling stricter checks.",
        icon: "\u{F02D}",
        title: "Current Status",
        to: "/docs/rules/guides/current-status",
    },
] as const satisfies readonly HomeCard[];

/** Render the Docusaurus landing page for the documentation site. */
export default function Home(): ReactElement {
    const logoSrc = useBaseUrl("/img/logo.svg");

    return (
        <Layout
            description={homepageDescription}
            title="Stylelint rules for CSS Grid"
        >
            <Head>
                <meta content={homepageKeywords} name="keywords" />
                <meta content={homepageSocialImageUrl} property="og:image" />
                <meta content="summary_large_image" name="twitter:card" />
                <meta content={homepageSocialImageUrl} name="twitter:image" />
                <script type="application/ld+json">
                    {JSON.stringify(homepageStructuredData)}
                </script>
            </Head>
            <header className={styles.heroBanner}>
                <div className={`container ${styles.heroContent}`}>
                    <div className={styles.heroGrid}>
                        <div>
                            <p className={styles.heroKicker}>
                                {`${heroKickerIcon} Stylelint plugin for CSS Grid ${heroKickerIcon2}`}
                            </p>
                            <Heading as="h1" className={styles.heroTitle}>
                                stylelint-plugin-grid
                            </Heading>
                            <p className={styles.heroSubtitle}>
                                A Stylelint-first plugin for CSS Grid templates,
                                built around{" "}
                                <Link
                                    className={`${styles.heroInlineLink} ${styles.heroInlineLinkStylelint}`}
                                    href="https://stylelint.io/developer-guide/plugins/"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    Stylelint
                                </Link>{" "}
                                and{" "}
                                <Link
                                    className={`${styles.heroInlineLink} ${styles.heroInlineLinkDocusaurus}`}
                                    href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    CSS Grid layout
                                </Link>
                                .
                            </p>

                            <div className={styles.heroBadgeRow}>
                                {heroBadges.map((badge) => (
                                    <article
                                        className={styles.heroBadge}
                                        key={badge.label}
                                    >
                                        <p className={styles.heroBadgeLabel}>
                                            <span
                                                aria-hidden="true"
                                                className={styles.heroBadgeIcon}
                                            >
                                                {badge.icon}
                                            </span>
                                            {badge.label}
                                        </p>
                                        <p
                                            className={
                                                styles.heroBadgeDescription
                                            }
                                        >
                                            {badge.description}
                                        </p>
                                    </article>
                                ))}
                            </div>

                            <div className={styles.heroActions}>
                                <Link
                                    className={`button button--lg ${styles.heroActionButton} ${styles.heroActionPrimary}`}
                                    to="/docs/rules/overview"
                                >
                                    {overviewButtonIcon} Start with Overview
                                </Link>
                                <Link
                                    className={`button button--lg ${styles.heroActionButton} ${styles.heroActionSecondary}`}
                                    to="/docs/rules/configs"
                                >
                                    {compareConfigsButtonIcon} Explore Configs
                                </Link>
                            </div>
                        </div>

                        <aside className={styles.heroPanel}>
                            <img
                                alt="stylelint-plugin-grid logo"
                                className={styles.heroPanelLogo}
                                decoding="async"
                                height="240"
                                loading="eager"
                                src={logoSrc}
                                width="240"
                            />
                        </aside>
                    </div>

                    <GitHubStats className={styles.heroLiveBadges} />

                    <div className={styles.heroStats}>
                        {heroStats.map((stat) => (
                            <article
                                className={styles.heroStatCard}
                                key={stat.headline}
                            >
                                <p className={styles.heroStatHeading}>
                                    {stat.headline}
                                </p>
                                <p className={styles.heroStatDescription}>
                                    {stat.description}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </header>

            <main className={styles.mainContent}>
                <section className="container">
                    <div className={styles.cardGrid}>
                        {homeCards.map((card) => (
                            <article className={styles.card} key={card.title}>
                                <div className={styles.cardHeader}>
                                    <p className={styles.cardIcon}>
                                        {card.icon}
                                    </p>
                                    <Heading
                                        as="h2"
                                        className={styles.cardTitle}
                                    >
                                        {card.title}
                                    </Heading>
                                </div>
                                <p className={styles.cardDescription}>
                                    {card.description}
                                </p>
                                <Link className={styles.cardLink} to={card.to}>
                                    Open section →
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>
            </main>
        </Layout>
    );
}
