import { animate } from 'framer-motion'

// Shared smooth-scroll helper. Uses Framer Motion's animate() instead of
// scrollIntoView({ behavior: 'smooth' }) because the browser API exposes no
// duration control and iOS Safari defaults to a much faster scroll than the
// rest of the site's motion language.
const EASE     = [0.32, 0.72, 0, 1]
const DURATION = 0.8

export function scrollToY(y, prefersReduced = false) {
  if (prefersReduced) { window.scrollTo(0, y); return }
  return animate(window.scrollY, y, {
    duration: DURATION,
    ease:     EASE,
    onUpdate: (v) => window.scrollTo(0, v),
  })
}

export function scrollToElement(el, prefersReduced = false, offset = 0) {
  if (!el) return
  const y = el.getBoundingClientRect().top + window.scrollY + offset
  return scrollToY(y, prefersReduced)
}
