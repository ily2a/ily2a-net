// JS breakpoints — mirror the --breakpoint-* tokens in globals.css for the
// cases where a layout decision is made in JS rather than purely in CSS
// variants (navbar/hero switching, and the Cal.com booking modal frame
// geometry). Keep these values in sync with globals.css.
export const BREAKPOINTS = {
  SM:     390,  // --breakpoint-sm
  MOBILE: 600,  // --breakpoint-mobile: compact navbar / stacked hero layout
  TAB:    730,  // --breakpoint-tab: compact tablet / landscape phone
  MD:     810,  // --breakpoint-md: mobile↔tablet boundary (booking modal frame)
  DESK:   1088, // --breakpoint-desk: compact desktop
  LG:     1200, // --breakpoint-lg: tablet↔desktop boundary (booking modal frame)
  XL:     1440, // --breakpoint-xl
}
