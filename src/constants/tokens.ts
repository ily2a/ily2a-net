// JS mirrors of the design tokens in src/app/globals.css (@theme).
// Use these only where a CSS variable or Tailwind class can't be used — WebGL /
// canvas, Next.js metadata strings, CSS mask stops, SVG geometry, and layout
// decisions made in JS. Keep every value in sync with globals.css: they
// describe the same tokens from two languages.

// ─── Colours ─────────────────────────────────────────────────────
export const BACKGROUND = '#0D1012'

// Opaque black for CSS `mask-image` gradients — masks need solid coverage,
// not a brand colour. Kept here so component files stay hex-free.
export const MASK_BLACK = '#000'

export const AMETHYST = {
  50:  '#f6f6f9',
  100: '#eeecf3',
  200: '#dedee8',
  300: '#cbc9da',
  400: '#b2adc7',
  500: '#9c95b6',
  600: '#8479a0',
  700: '#6c6284',
  800: '#5a516c',
  900: '#484257',
  950: '#2e2937',
}

// ─── Radii (px) ──────────────────────────────────────────────────
// For the few places JS needs a number (e.g. SVG path geometry).
export const RADII = {
  PILL:         8,  // --radius-pill
  INPUT:        10, // --radius-input
  BUTTON_INSET: 7,  // --radius-button-inset
  GLASS:        12, // --radius-glass
} as const

// ─── Breakpoints (px) ────────────────────────────────────────────
// For layout decisions made in JS rather than purely in CSS variants
// (navbar/hero switching, and the Cal.com booking modal frame geometry).
export const BREAKPOINTS = {
  SM:     390,  // --breakpoint-sm
  MOBILE: 600,  // --breakpoint-mobile: compact navbar / stacked hero layout
  TAB:    730,  // --breakpoint-tab: compact tablet / landscape phone
  MD:     810,  // --breakpoint-md: mobile↔tablet boundary (booking modal frame)
  DESK:   1088, // --breakpoint-desk: compact desktop
  LG:     1200, // --breakpoint-lg: tablet↔desktop boundary (booking modal frame)
  XL:     1440, // --breakpoint-xl
}
