'use client'

import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Thin client wrapper that:
 *  - lazily loads only the `domAnimation` feature set (animations, variants,
 *    exit/AnimatePresence, hover/tap gestures) — no layout/drag — via LazyMotion,
 *    so components import the lightweight `m` instead of the full `motion` bundle.
 *  - applies `reducedMotion="user"` globally so every animation respects the OS
 *    preference.
 *
 * Not `strict`: the embedded Sanity Studio route renders its own Framer Motion
 * (full `motion`) inside this tree, and strict mode would throw on it.
 *
 * Must be a separate 'use client' file so it can be imported from the server layout.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  )
}
