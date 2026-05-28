/**
 * @remarks
 * The previous template used a much more specialized sidebar enhancer that was
 * tightly coupled to the old rule-doc taxonomy. The new Stylelint template
 * keeps this module intentionally small until the new docs IA settles.
 *
 * @packageDocumentation
 * Lightweight client-side enhancement bootstrap for the docs site.
 */

interface EnhancementsWindow {
    initializeAdvancedFeatures?: InitializeAdvancedFeatures;
}

type InitializeAdvancedFeatures = () => void;

declare global {
    interface Window {
        initializeAdvancedFeatures?: InitializeAdvancedFeatures;
    }
}

/** Initialize client-side enhancements after hydration. */
export const initializeAdvancedFeatures: InitializeAdvancedFeatures = () => {
    // Intentionally minimal for the Stylelint template bootstrap phase.
};

const browserWindow: unknown = Reflect.get(globalThis, "window");

if (isEnhancementsWindow(browserWindow)) {
    browserWindow.initializeAdvancedFeatures = initializeAdvancedFeatures;
    globalThis.queueMicrotask(() => {
        initializeAdvancedFeatures();
    });
}

function isEnhancementsWindow(value: unknown): value is EnhancementsWindow {
    return typeof value === "object" && value !== null;
}
