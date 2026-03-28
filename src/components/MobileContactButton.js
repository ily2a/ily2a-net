'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function MobileContactButton({ label = 'Contact', onClick }) {
  const [ripples, setRipples] = useState([])
  const buttonRef = useRef(null)

  const triggerRipple = (x, y) => {
    const button = buttonRef.current
    if (!button) return
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    setRipples((prev) => [...prev, { x: x - rect.left - size / 2, y: y - rect.top - size / 2, size, key: Date.now() }])
  }

  const handleClick = (e) => {
    triggerRipple(e.clientX, e.clientY)
    onClick?.()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const button = buttonRef.current
      if (!button) return
      const rect = button.getBoundingClientRect()
      triggerRipple(rect.left + rect.width / 2, rect.top + rect.height / 2)
    }
  }

  useEffect(() => {
    if (ripples.length === 0) return
    const last = ripples[ripples.length - 1]
    const timeout = setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.key !== last.key))
    }, 600)
    return () => clearTimeout(timeout)
  }, [ripples])

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 2000, damping: 110, mass: 1 }}
      className="relative inline-flex items-center justify-center w-full h-11 rounded-[8px] border border-white/[0.08] bg-surface cursor-pointer overflow-hidden select-none"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <span className="btn-label relative z-[1] text-text-primary pointer-events-none">
        {label}
      </span>
      <span className="absolute inset-0 pointer-events-none">
        {ripples.map((ripple) => (
          <span
            key={ripple.key}
            style={{
              position: 'absolute',
              width: `${ripple.size}px`,
              height: `${ripple.size}px`,
              top: `${ripple.y}px`,
              left: `${ripple.x}px`,
              borderRadius: '50%',
              backgroundColor: 'var(--color-amethyst-100)',
              opacity: 0.3,
              transform: 'scale(0)',
              animation: 'ripple 600ms ease-out forwards',
            }}
          />
        ))}
      </span>
    </motion.button>
  )
}