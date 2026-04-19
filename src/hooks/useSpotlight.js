'use client'

import { useEffect, useRef } from 'react'

// Tracks pointer position relative to the element and writes it as
// --mx / --my CSS variables. Used by buttons that paint a radial spotlight
// at the cursor via background-image. RAF-throttled so movement never
// fires more than once per frame.
export function useSpotlight() {
  const ref    = useRef(null)
  const rafRef = useRef(0)

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  const onMouseMove = (e) => {
    if (rafRef.current) return
    const { clientX, clientY } = e
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${clientX - rect.left}px`)
      el.style.setProperty('--my', `${clientY - rect.top}px`)
    })
  }

  return { ref, onMouseMove }
}
