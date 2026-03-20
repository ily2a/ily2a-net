// Shared Framer Motion spring configs
// SPRING_SNAP   — instant button state feedback (hover/press)
// SPRING_ENTRANCE — hero element entrance (slow, weighted)
// SPRING_NAV    — navbar slide-up entrance
// SPRING_CARD   — project card tap response

export const SPRING_SNAP     = { type: 'spring', stiffness: 2000, damping: 110, mass: 1 }
export const SPRING_ENTRANCE = { type: 'spring', stiffness: 120,  damping: 30,  mass: 1 }
export const SPRING_NAV      = { type: 'spring', stiffness: 120,  damping: 20,  mass: 1.5 }
export const SPRING_CARD     = { type: 'spring', stiffness: 400,  damping: 30 }

// Coordinated entrance delays (seconds) — timed relative to TextReveal sequence
export const HERO_SUBTITLE_DELAY = 3.5  // second TextReveal line starts
export const HERO_BUTTON_DELAY   = 6    // CTA buttons appear after text finishes
export const HERO_NAV_DELAY      = 6.5  // navbar slides up just after buttons
