'use client'

import { useEffect, useRef, useState } from 'react'
import { m, useSpring, AnimatePresence } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { SPRING_CURSOR, SPRING_SNAP } from '@/constants/animations'

const DESKTOP_QUERY  = '(any-hover: hover) and (any-pointer: fine)'
// Any element can opt into the expanded cursor label by declaring
// data-cursor-label="…" — an explicit contract instead of reaching into a
// component's CSS class. ProjectCard sets data-cursor-label="View project".
const CURSOR_TARGET  = '[data-cursor-label]'

export default function SmoothCursor() {
  const prefersReduced = usePrefersReducedMotion()
  const [isEnabled,  setIsEnabled]  = useState(false)
  const [isVisible,  setIsVisible]  = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [hoverLabel, setHoverLabel] = useState('')
  const [isClicking, setIsClicking] = useState(false)
  const lastPoint    = useRef<{ x: number; y: number } | null>(null) // last pointer position, for re-checking hover on scroll
  const scrollRaf    = useRef(0)
  const hasShown     = useRef(false)

  const cursorX = useSpring(0, SPRING_CURSOR)
  const cursorY = useSpring(0, SPRING_CURSOR)

  // Enable only on pointer-capable desktops
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY)
    const update = () => {
      setIsEnabled(mq.matches)
      if (!mq.matches) {
        hasShown.current = false
        setIsVisible(false)
      }
    }
    // Must sync after mount — matchMedia can't be read during SSR render.
    // react-doctor-disable-next-line react-doctor/no-initialize-state
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Effect intentionally re-subscribes only on isEnabled/prefersReduced; the
  // listeners read live state through refs. See the eslint-disable on the deps below.
  // react-doctor-disable-next-line react-doctor/exhaustive-deps
  useEffect(() => {
    if (!isEnabled || prefersReduced) return

    // Set hover state from whatever element is (or isn't) a cursor target.
    const setHoverFromTarget = (el: HTMLElement | null) => {
      const label = el?.dataset.cursorLabel ?? ''
      setIsHovering(prev => prev === !!el  ? prev : !!el)
      setHoverLabel(prev => prev === label ? prev : label)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const { clientX, clientY } = e
      lastPoint.current = { x: clientX, y: clientY }
      // Drive springs directly — RAF batching added a frame of lag and could
      // drop intermediate positions within the same frame.
      cursorX.set(clientX)
      cursorY.set(clientY)
      if (!hasShown.current) {
        hasShown.current = true
        setIsVisible(true)
      }
    }

    const onMouseOver = (e: MouseEvent) =>
      setHoverFromTarget(e.target instanceof Element ? (e.target.closest(CURSOR_TARGET) as HTMLElement | null) : null)

    // Scrolling moves content under a stationary cursor without firing mouseover,
    // so the hover label would otherwise stay stuck after a card scrolls away.
    // Re-check what's under the last known pointer position. RAF-throttled because
    // elementFromPoint forces a layout read.
    const onScroll = () => {
      if (scrollRaf.current || !lastPoint.current) return
      scrollRaf.current = requestAnimationFrame(() => {
        scrollRaf.current = 0
        const pt = lastPoint.current
        if (!pt) return
        const target = document.elementFromPoint(pt.x, pt.y)?.closest(CURSOR_TARGET)
        setHoverFromTarget((target as HTMLElement | null) ?? null)
      })
    }

    const onMouseDown = () => setIsClicking(true)
    const onMouseUp   = () => setIsClicking(false)
    const onBlur      = () => setIsClicking(false)

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('mouseover',   onMouseOver)
    window.addEventListener('scroll',      onScroll, { passive: true })
    window.addEventListener('mousedown',   onMouseDown)
    window.addEventListener('mouseup',     onMouseUp)
    window.addEventListener('blur',        onBlur)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('mouseover',   onMouseOver)
      window.removeEventListener('scroll',      onScroll)
      window.removeEventListener('mousedown',   onMouseDown)
      window.removeEventListener('mouseup',     onMouseUp)
      window.removeEventListener('blur',        onBlur)
      if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current)
    }
  // cursorX/cursorY are stable spring objects — excluding them from deps is intentional
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled, prefersReduced]) // react-doctor-disable-line react-doctor/exhaustive-deps

  useEffect(() => {
    if (!isEnabled || prefersReduced) return
    document.body.classList.add('smooth-cursor-active')
    return () => document.body.classList.remove('smooth-cursor-active')
  }, [isEnabled, prefersReduced])

  if (!isEnabled || prefersReduced) return null

  return (
    <m.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none will-change-transform"
      style={{ x: cursorX, y: cursorY }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={SPRING_SNAP}
    >
      {/* Centering lives on its own element: the spring drives the outer
          element's transform (composited translate3d, off the main thread),
          so the -50% offset can't share that transform. */}
      <div className="-translate-x-1/2 -translate-y-1/2">
      <m.div
        className="flex items-center justify-center overflow-hidden backdrop-blur-[20px] backdrop-saturate-300"
        animate={{
          width:        isHovering ? 120 : 16,
          height:       isHovering ? 36  : 16,
          scale:        isClicking ? 0.96 : 1,
          borderRadius: isHovering ? 8   : 9999,
        }}
        transition={SPRING_SNAP}
        style={{
          background: 'color-mix(in srgb, var(--color-amethyst-400) 20%, transparent)',
          border:     '1px solid color-mix(in srgb, var(--color-amethyst-400) 40%, transparent)',
          boxShadow:  'inset 0 1px 0 0 var(--color-glass-border), inset 0 -1px 0 0 var(--color-glass-bg)',
        }}
      >
        <AnimatePresence>
          {isHovering && (
            <m.span
              className="text-cursor text-text-primary pointer-events-none select-none"
              initial={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1,   filter: 'blur(0px)' }}
              exit={{    opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
              transition={SPRING_SNAP}
            >
              {hoverLabel}
            </m.span>
          )}
        </AnimatePresence>
      </m.div>
      </div>
    </m.div>
  )
}
