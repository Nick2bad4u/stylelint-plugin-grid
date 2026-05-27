/**
 * @packageDocumentation
 * Shareable Stylelint config: grid-recommended.
 */

import { gridPluginConfigs, type GridShareableConfig } from "../plugin.js";

/** Shareable config that enables low-noise grid safety rules. */
const gridRecommendedConfig: GridShareableConfig =
    gridPluginConfigs["grid-recommended"];

export default gridRecommendedConfig;
