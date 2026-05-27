/**
 * @packageDocumentation
 * Shareable Stylelint config: grid-all.
 */

import { gridPluginConfigs, type GridShareableConfig } from "../plugin.js";

/** Shareable config that enables every public grid safety rule. */
const gridAllConfig: GridShareableConfig = gridPluginConfigs["grid-all"];

export default gridAllConfig;
