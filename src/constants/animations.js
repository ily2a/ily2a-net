// Shared Framer Motion spring configs
// SPRING_SNAP   — instant button state feedback (hover/press), Apple-style
// SPRING_ENTRANCE — hero element entrance (slow, weighted)
// SPRING_NAV    — navbar slide-up entrance

export const SPRING_SNAP     = { type: 'spring', duration: 0.18, bounce: 0 }
export const SPRING_ENTRANCE = { type: 'spring', stiffness: 120,  damping: 30,  mass: 1 }
export const SPRING_NAV      = { type: 'spring', stiffness: 120,  damping: 20,  mass: 1.5 }

// Custom easing curve — stronger than the built-in CSS/Framer easings.
// EASE_OUT is the canonical UI-entrance curve (starts fast, settles smoothly).
export const EASE_OUT = [0.23, 1, 0.32, 1]

// Shared micro-lift for button hover — 1px rise gives a tactile hint without
// disturbing layout. Kept as `{ y }` (Framer Motion value channel) rather
// than a literal `transform` string: the full-string form composites on the
// GPU but overrides any concurrent `scale`/`y`/`x` value channels (entrance
// animations, whileTap), leaving buttons stuck at the wrong size.
export const HOVER_LIFT = { y: -1 }

// Coordinated entrance delays (seconds) — timed relative to TextReveal sequence.
// TextReveal animates word-by-word at 0.06s/word.
// First line (12 words) finishes ≈ 1.2s; second line (7 words) finishes ≈ 2.0s.
export const HERO_SUBTITLE_DELAY = 1.2  // second TextReveal line starts right after first settles
export const HERO_BUTTON_DELAY   = 2.0  // CTA buttons appear as second text line settles
export const HERO_NAV_DELAY      = 2.4  // navbar slides up just after buttons

// Scroll-triggered section entrance — pass a delay (seconds) for staggered children.
export const fadeUp = (delay = 0) => ({
  initial:     { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, margin: '-80px' },
  transition:  { type: 'spring', stiffness: 260, damping: 24, delay },
})
