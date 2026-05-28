/**
 * @packageDocumentation
 * Canonical registry of public Stylelint rules exported by this package.
 */
/* eslint-disable import-x/max-dependencies -- The public registry intentionally imports every rule module exactly once. */
import type { StylelintPluginRuleContract } from "./create-stylelint-rule.js";

import * as consistentAreaNamingModule from "../rules/consistent-area-naming.js";
import * as noConflictingPlacementModule from "../rules/no-conflicting-placement.js";
import * as noDenseAutoFlowModule from "../rules/no-dense-auto-flow.js";
import * as noIneffectiveContainerPropertiesModule from "../rules/no-ineffective-container-properties.js";
import * as noInvalidAreasModule from "../rules/no-invalid-areas.js";
import * as noInvalidAutoRepeatModule from "../rules/no-invalid-auto-repeat.js";
import * as noInvalidMinmaxModule from "../rules/no-invalid-minmax.js";
import * as noInvalidRepeatCountModule from "../rules/no-invalid-repeat-count.js";
import * as noInvalidSpanModule from "../rules/no-invalid-span.js";
import * as noMismatchedTemplateRowsModule from "../rules/no-mismatched-template-rows.js";
import * as noOverlappingAreasModule from "../rules/no-overlapping-areas.js";
import * as noReversedPlacementLinesModule from "../rules/no-reversed-placement-lines.js";
import * as noUnknownAreasModule from "../rules/no-unknown-areas.js";
import * as noUnusedAreasModule from "../rules/no-unused-areas.js";
import * as noZeroGridLinesModule from "../rules/no-zero-grid-lines.js";
import * as preferGapPropertiesModule from "../rules/prefer-gap-properties.js";
import * as preferMinmaxZeroFrModule from "../rules/prefer-minmax-zero-fr.js";
import * as requireExplicitRowsWithColumnFlowModule from "../rules/require-explicit-rows-with-column-flow.js";
import * as requireExplicitTracksWithAreasModule from "../rules/require-explicit-tracks-with-areas.js";
import * as validateAreaShapesModule from "../rules/validate-area-shapes.js";
import * as validateTrackCountsModule from "../rules/validate-track-counts.js";
/* eslint-enable import-x/max-dependencies -- Re-enable after the intentional registry import list. */

/** Public rule registry keyed by unqualified rule name. */
export const gridRules: Readonly<Record<string, StylelintPluginRuleContract>> =
    {
        "consistent-area-naming": consistentAreaNamingModule.default,
        "no-conflicting-placement": noConflictingPlacementModule.default,
        "no-dense-auto-flow": noDenseAutoFlowModule.default,
        "no-ineffective-container-properties":
            noIneffectiveContainerPropertiesModule.default,
        "no-invalid-areas": noInvalidAreasModule.default,
        "no-invalid-auto-repeat": noInvalidAutoRepeatModule.default,
        "no-invalid-minmax": noInvalidMinmaxModule.default,
        "no-invalid-repeat-count": noInvalidRepeatCountModule.default,
        "no-invalid-span": noInvalidSpanModule.default,
        "no-mismatched-template-rows": noMismatchedTemplateRowsModule.default,
        "no-overlapping-areas": noOverlappingAreasModule.default,
        "no-reversed-placement-lines": noReversedPlacementLinesModule.default,
        "no-unknown-areas": noUnknownAreasModule.default,
        "no-unused-areas": noUnusedAreasModule.default,
        "no-zero-grid-lines": noZeroGridLinesModule.default,
        "prefer-gap-properties": preferGapPropertiesModule.default,
        "prefer-minmax-zero-fr": preferMinmaxZeroFrModule.default,
        "require-explicit-rows-with-column-flow":
            requireExplicitRowsWithColumnFlowModule.default,
        "require-explicit-tracks-with-areas":
            requireExplicitTracksWithAreasModule.default,
        "validate-area-shapes": validateAreaShapesModule.default,
        "validate-track-counts": validateTrackCountsModule.default,
    };

/** Public rule registry type. */
export type GridRulesRegistry = typeof gridRules;
