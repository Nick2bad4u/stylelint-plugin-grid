---
title: Developer Docs
description: Maintainer and contributor documentation for stylelint-plugin-grid-safety.
---

# Developer Docs

This section covers the maintainer-facing side of `stylelint-plugin-grid-safety`.

## What lives here

- Docusaurus site maintenance notes
- generated API documentation entrypoints
- future architecture notes and ADRs
- maintainer guidance for evolving the Stylelint plugin

## Current focus

The repository is currently bootstrapped as a CSS Grid safety plugin:

- copied Docusaurus/Infima rule content has been removed
- the Stylelint runtime exports a `grid/*` rule catalog
- docs and sync scripts are generated from static rule metadata

Use the API section once generated TypeDoc output is available, and treat this area as the home for future maintainer documentation.
