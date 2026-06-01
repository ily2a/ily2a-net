// Converts a hex color string (#RRGGBB, with or without the leading #) into an
// [r, g, b] array normalized to 0..1, suitable for a WebGL vec3 uniform.
// Shared by the ogl-based backgrounds (HeroBg, NotFoundPasswordBg) that feed
// design-token colors into shaders, where CSS variables can't reach.
// padEnd guards against a short/malformed string yielding NaN channels.
export function hexToRgbNormalized(hex) {
  const c = hex.replace('#', '').padEnd(6, '0')
  return [
    parseInt(c.slice(0, 2), 16) / 255,
    parseInt(c.slice(2, 4), 16) / 255,
    parseInt(c.slice(4, 6), 16) / 255,
  ]
}
