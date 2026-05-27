/**
 * @packageDocumentation
 * Canonical registry of public Stylelint rules exported by this package.
 */
import type { StylelintPluginRuleContract } from "./create-stylelint-rule.js";

import * as consistentAreaNamingModule from "../rules/consistent-area-naming.js";
import * as noInvalidAreasModule from "../rules/no-invalid-areas.js";
import * as noMismatchedTemplateRowsModule from "../rules/no-mismatched-template-rows.js";
import * as noOverlappingAreasModule from "../rules/no-overlapping-areas.js";
import * as noUnknownAreasModule from "../rules/no-unknown-areas.js";
import * as noUnusedAreasModule from "../rules/no-unused-areas.js";
import * as preferGapPropertiesModule from "../rules/prefer-gap-properties.js";
import * as validateAreaShapesModule from "../rules/validate-area-shapes.js";
import * as validateTrackCountsModule from "../rules/validate-track-counts.js";

/** Public rule registry keyed by unqualified rule name. */
export const gridRules: Readonly<Record<string, StylelintPluginRuleContract>> =
    {
        "consistent-area-naming": consistentAreaNamingModule.default,
        "no-invalid-areas": noInvalidAreasModule.default,
        "no-mismatched-template-rows": noMismatchedTemplateRowsModule.default,
        "no-overlapping-areas": noOverlappingAreasModule.default,
        "no-unknown-areas": noUnknownAreasModule.default,
        "no-unused-areas": noUnusedAreasModule.default,
        "prefer-gap-properties": preferGapPropertiesModule.default,
        "validate-area-shapes": validateAreaShapesModule.default,
        "validate-track-counts": validateTrackCountsModule.default,
    };

/** Public rule registry type. */
export type GridRulesRegistry = typeof gridRules;
