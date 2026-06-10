import { animate, type AnimationPlaybackControls } from 'framer-motion'

// Shared smooth-scroll helper. Uses Framer Motion's animate() instead of
// scrollIntoView({ behavior: 'smooth' }) because the browser API exposes no
// duration control and iOS Safari defaults to a much faster scroll than the
// rest of the site's motion language.
const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1]
const DURATION = 0.8

// Module-level controller so concurrent calls (e.g. user clicks ToC link
// while a programmatic scroll is mid-animate) don't both write to
// window.scrollY from competing RAF loops. The latest call wins.
let current: AnimationPlaybackControls | null = null

export function scrollToY(y: number, prefersReduced = false): AnimationPlaybackControls | null {
  current?.stop()
  current = null
  if (prefersReduced) { window.scrollTo(0, y); return null }
  const controls = animate(window.scrollY, y, {
    duration: DURATION,
    ease:     EASE,
    onUpdate: (v) => window.scrollTo(0, v),
    onComplete: () => { if (current === controls) current = null },
    onStop:     () => { if (current === controls) current = null },
  })
  current = controls
  return controls
}

export function scrollToElement(
  el: Element | null,
  prefersReduced = false,
  offset = 0,
): AnimationPlaybackControls | null {
  if (!el) return null
  const y = el.getBoundingClientRect().top + window.scrollY + offset
  return scrollToY(y, prefersReduced)
}
