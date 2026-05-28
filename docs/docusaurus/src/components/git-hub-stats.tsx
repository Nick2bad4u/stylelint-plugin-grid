import type { ReactElement } from "react";

import Link from "@docusaurus/Link";

import styles from "./GitHubStats.module.css";

interface GitHubStatsProps {
    readonly className?: string;
}

interface LiveBadge {
    readonly alt: string;
    readonly href: string;
    readonly src: string;
}

const liveBadges = [
    {
        alt: "Codecov",
        href: "https://app.codecov.io/gh/Nick2bad4u/stylelint-plugin-grid",
        src: "https://flat.badgen.net/codecov/github/Nick2bad4u/stylelint-plugin-grid?color=0ea5e9",
    },
    {
        alt: "GitHub forks",
        href: "https://github.com/Nick2bad4u/stylelint-plugin-grid/forks",
        src: "https://flat.badgen.net/github/forks/Nick2bad4u/stylelint-plugin-grid?color=84cc16",
    },
    {
        alt: "GitHub open issues",
        href: "https://github.com/Nick2bad4u/stylelint-plugin-grid/issues",
        src: "https://flat.badgen.net/github/open-issues/Nick2bad4u/stylelint-plugin-grid?color=d946ef",
    },
    {
        alt: "GitHub stars",
        href: "https://github.com/Nick2bad4u/stylelint-plugin-grid/stargazers",
        src: "https://flat.badgen.net/github/stars/Nick2bad4u/stylelint-plugin-grid?color=f59e0b",
    },
    {
        alt: "latest GitHub release",
        href: "https://github.com/Nick2bad4u/stylelint-plugin-grid/releases",
        src: "https://flat.badgen.net/github/release/Nick2bad4u/stylelint-plugin-grid?color=22d3ee",
    },
    {
        alt: "npm license",
        href: "https://github.com/Nick2bad4u/stylelint-plugin-grid/blob/main/LICENSE",
        src: "https://flat.badgen.net/npm/license/stylelint-plugin-grid?color=0f766e",
    },
    {
        alt: "npm total downloads",
        href: "https://www.npmjs.com/package/stylelint-plugin-grid",
        src: "https://flat.badgen.net/npm/dt/stylelint-plugin-grid?color=f43f5e",
    },
] as const satisfies readonly LiveBadge[];

/**
 * Renders live repository and package badges for the docs homepage.
 */
export default function GitHubStats({
    className = "",
}: GitHubStatsProps): ReactElement {
    const badgeListClassName = [styles.liveBadgeList, className]
        .filter(Boolean)
        .join(" ");

    return (
        <ul className={badgeListClassName}>
            {liveBadges.map((badge) => (
                <li className={styles.liveBadgeListItem} key={badge.src}>
                    <Link
                        className={styles.liveBadgeAnchor}
                        href={badge.href}
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        <img
                            alt={badge.alt}
                            className={styles.liveBadgeImage}
                            decoding="async"
                            loading="lazy"
                            src={badge.src}
                        />
                    </Link>
                </li>
            ))}
        </ul>
    );
}
