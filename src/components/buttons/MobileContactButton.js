'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { SPRING_SNAP } from '@/constants/animations'

export default function MobileContactButton({ label = 'Contact', onClick, 'aria-current': ariaCurrent }) {
  const [ripples, setRipples] = useState([])
  const buttonRef  = useRef(null)
  const prefersReduced = usePrefersReducedMotion()

  const triggerRipple = (x, y) => {
    if (prefersReduced) return
    const button = buttonRef.current
    if (!button) return
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const key  = Date.now()
    setRipples((prev) => [...prev, { x: x - rect.left - size / 2, y: y - rect.top - size / 2, size, key }])
  }

  const handleClick = (e) => {
    triggerRipple(e.clientX, e.clientY)
    onClick?.()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (e.key === ' ') e.preventDefault()
      const button = buttonRef.current
      if (!button) return
      const rect = button.getBoundingClientRect()
      triggerRipple(rect.left + rect.width / 2, rect.top + rect.height / 2)
    }
  }

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-current={ariaCurrent}
      whileTap={{ scale: 0.96 }}
      transition={SPRING_SNAP}
      className="relative inline-flex items-center justify-center w-full h-11 rounded-[8px] border border-glass-border bg-surface cursor-pointer overflow-hidden select-none"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <span className="btn-label relative z-[1] text-text-primary pointer-events-none">
        {label}
      </span>
      <span className="absolute inset-0 pointer-events-none">
        {!prefersReduced && ripples.map((ripple) => (
          <motion.span
            key={ripple.key}
            initial={{ scale: 0, opacity: 0.3 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            onAnimationComplete={() => setRipples((prev) => prev.filter((r) => r.key !== ripple.key))}
            style={{
              position: 'absolute',
              width: `${ripple.size}px`,
              height: `${ripple.size}px`,
              top: `${ripple.y}px`,
              left: `${ripple.x}px`,
              borderRadius: '50%',
              backgroundColor: 'var(--color-amethyst-100)',
            }}
          />
        ))}
      </span>
    </motion.button>
  )
}
