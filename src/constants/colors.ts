// Palette hex values — mirrors globals.css @theme tokens.
// Use these only where CSS variables cannot be used (e.g. WebGL / canvas,
// Next.js metadata that must be a string at build time, CSS mask stops).
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
