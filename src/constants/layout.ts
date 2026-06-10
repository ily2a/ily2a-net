// JS breakpoints — mirror the --breakpoint-* tokens in globals.css for the
// cases where a layout decision is made in JS rather than purely in CSS
// variants (navbar/hero switching, and the Cal.com booking modal frame
// geometry). Keep these values in sync with globals.css.
export const BREAKPOINTS = {
  MOBILE: 600,  // --breakpoint-mobile: compact navbar / stacked hero layout
  MD:     810,  // --breakpoint-md: mobile↔tablet boundary (booking modal frame)
  LG:     1200, // --breakpoint-lg: tablet↔desktop boundary (booking modal frame)
}
