'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useSpring, AnimatePresence } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const DESKTOP_QUERY  = '(any-hover: hover) and (any-pointer: fine)'
const CARD_SELECTOR  = '.project-card, .project-card-mobile'
const SPRING         = { damping: 45, stiffness: 400, mass: 1, restDelta: 0.001 }

export function SmoothCursor() {
  const prefersReduced = usePrefersReducedMotion()
  const [isEnabled,  setIsEnabled]  = useState(false)
  const [isVisible,  setIsVisible]  = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const rafId = useRef(0)

  const cursorX = useSpring(0, SPRING)
  const cursorY = useSpring(0, SPRING)

  // Enable only on pointer-capable desktops
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY)
    const update = () => { setIsEnabled(mq.matches); if (!mq.matches) setIsVisible(false) }
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!isEnabled) return

    const onPointerMove = (e) => {
      if (e.pointerType === 'touch') return
      setIsVisible(true)
      if (rafId.current) return
      rafId.current = requestAnimationFrame(() => {
        cursorX.set(e.clientX)
        cursorY.set(e.clientY)
        rafId.current = 0
      })
    }

    const onMouseOver = (e) => {
      const next = !!e.target.closest(CARD_SELECTOR)
      setIsHovering(prev => prev === next ? prev : next)
    }

    const onMouseDown = () => setIsClicking(true)
    const onMouseUp   = () => setIsClicking(false)
    const onBlur      = () => setIsClicking(false)

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('mouseover',   onMouseOver)
    window.addEventListener('mousedown',   onMouseDown)
    window.addEventListener('mouseup',     onMouseUp)
    window.addEventListener('blur',        onBlur)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('mouseover',   onMouseOver)
      window.removeEventListener('mousedown',   onMouseDown)
      window.removeEventListener('mouseup',     onMouseUp)
      window.removeEventListener('blur',        onBlur)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [cursorX, cursorY, isEnabled])

  if (!isEnabled || prefersReduced) return null

  return (
    <motion.div
      className="fixed z-[9999] pointer-events-none will-change-transform"
      style={{ left: cursorX, top: cursorY, translateX: '-50%', translateY: '-50%' }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.15 }}
    >
      <motion.div
        className="flex items-center justify-center overflow-hidden backdrop-blur-[20px] backdrop-saturate-300"
        animate={{
          width:        isHovering ? 120 : 16,
          height:       isHovering ? 36  : 16,
          scale:        isClicking ? 0.8 : 1,
          borderRadius: isHovering ? 8   : 9999,
        }}
        transition={{ ease: 'easeInOut', duration: 0.2 }}
        style={{
          background: 'color-mix(in srgb, var(--color-amethyst-400) 20%, transparent)',
          border:     '1px solid color-mix(in srgb, var(--color-amethyst-400) 40%, transparent)',
          boxShadow:  'inset 0 1px 0 0 rgba(255,255,255,0.08), inset 0 -1px 0 0 rgba(255,255,255,0.04)',
        }}
      >
        <AnimatePresence>
          {isHovering && (
            <motion.span
              className="text-[14px] font-medium text-text-primary whitespace-nowrap tracking-[0.02em] pointer-events-none select-none"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{    opacity: 0, scale: 0.6 }}
              transition={{ ease: 'easeInOut', duration: 0.15 }}
            >
              View project
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
