// Pixel radii — mirror the --radius-* tokens in globals.css for the few
// places JS needs a number (e.g. SVG path geometry). Keep in sync.
export const RADII = {
  PILL:         8,  // --radius-pill
  INPUT:        10, // --radius-input
  BUTTON_INSET: 7,  // --radius-button-inset
  GLASS:        12, // --radius-glass
} as const
