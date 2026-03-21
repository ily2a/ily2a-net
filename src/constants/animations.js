// Shared Framer Motion spring configs
// SPRING_SNAP   — instant button state feedback (hover/press)
// SPRING_ENTRANCE — hero element entrance (slow, weighted)
// SPRING_NAV    — navbar slide-up entrance
// SPRING_CARD   — project card tap response

export const SPRING_SNAP     = { type: 'spring', stiffness: 2000, damping: 110, mass: 1 }
export const SPRING_ENTRANCE = { type: 'spring', stiffness: 120,  damping: 30,  mass: 1 }
export const SPRING_NAV      = { type: 'spring', stiffness: 120,  damping: 20,  mass: 1.5 }
export const SPRING_CARD     = { type: 'spring', stiffness: 400,  damping: 30 }

// Coordinated entrance delays (seconds) — timed relative to TextReveal sequence.
// TextReveal animates word-by-word at 0.06s/word.
// First line (12 words) finishes ≈ 1.2s; second line (7 words) finishes ≈ 2.0s.
export const HERO_SUBTITLE_DELAY = 1.2  // second TextReveal line starts right after first settles
export const HERO_BUTTON_DELAY   = 2.0  // CTA buttons appear as second text line settles
export const HERO_NAV_DELAY      = 2.4  // navbar slides up just after buttons
