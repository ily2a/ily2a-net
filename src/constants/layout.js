// JS breakpoints — mirror the CSS custom properties in globals.css @theme
// --breakpoint-sm: 390px  --breakpoint-tab: 730px  --breakpoint-md: 810px  --breakpoint-lg: 1200px  --breakpoint-xl: 1440px
export const BREAKPOINTS = {
  MOBILE:  600,   // compact navbar / stacked hero layout (custom threshold between sm and md)
  TAB:     730,   // --breakpoint-tab (tablet / landscape phone)
  TABLET:  810,   // --breakpoint-md
  DESKTOP: 1200,  // --breakpoint-lg
  WIDE:    1440,  // --breakpoint-xl
}
