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
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '44px',
        borderRadius: '8px',
        border: '1px solid var(--color-amethyst-900)',
        background: '#151A1E',
        cursor: 'pointer',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span
        className="btn-label"
        style={{
          position: 'relative',
          zIndex: 1,
          color: 'var(--color-text-primary)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <span style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
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