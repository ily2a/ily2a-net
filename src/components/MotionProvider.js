'use client'

import { MotionConfig } from 'framer-motion'

/**
 * Thin client wrapper that applies `reducedMotion="user"` globally.
 * All Framer Motion animations in the tree will respect the OS preference.
 * Must be a separate 'use client' file so it can be imported from the server layout.
 */
export default function MotionProvider({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
