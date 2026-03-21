'use client'

import { useEffect, useState } from 'react'

/**
 * Returns true when the user has requested reduced motion via their OS settings.
 * Reactively updates if the preference changes while the page is open.
 */
export function usePrefersReducedMotion() {
  // Start false (matches server) to avoid hydration mismatch;
  // set real value in useEffect after mount.
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mq.matches)
    const handler = (e) => setPrefersReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return prefersReduced
}
