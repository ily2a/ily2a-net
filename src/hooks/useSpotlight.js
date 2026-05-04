'use client'

import { useCallback, useEffect, useRef } from 'react'

// Tracks pointer position relative to the element and writes it as
// --mx / --my CSS variables. Used by buttons that paint a radial spotlight
// at the cursor via background-image. RAF-throttled so movement never
// fires more than once per frame.
//
// Rect is cached via ResizeObserver + scroll/resize listeners so the RAF
// callback can stay layout-read-free. Calling getBoundingClientRect() inside
// RAF would force a mid-frame layout recalc whenever Framer Motion is
// concurrently writing transforms (modal opens, entrance animations) — with
// multiple spotlight buttons in-viewport at once, that compounds to several
// forced reads per frame during hover.
export function useSpotlight() {
  const ref     = useRef(null)
  const rafRef  = useRef(0)
  const rectRef = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const updateRect = () => { rectRef.current = el.getBoundingClientRect() }
    updateRect()

    const ro = new ResizeObserver(updateRect)
    ro.observe(el)
    // Page-level scroll/resize change the element's viewport rect even when
    // its size doesn't, so cover those too. Both are passive; total cost is
    // a single getBoundingClientRect() per event, batched outside RAF.
    window.addEventListener('scroll', updateRect, { passive: true })
    window.addEventListener('resize', updateRect)

    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', updateRect)
      window.removeEventListener('resize', updateRect)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const onMouseMove = useCallback((e) => {
    if (rafRef.current) return
    const { clientX, clientY } = e
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0
      const el   = ref.current
      const rect = rectRef.current
      if (!el || !rect) return
      el.style.setProperty('--mx', `${clientX - rect.left}px`)
      el.style.setProperty('--my', `${clientY - rect.top}px`)
    })
  }, [])

  return { ref, onMouseMove }
}
