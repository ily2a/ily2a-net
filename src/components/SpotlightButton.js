'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { SPRING_SNAP } from '@/constants/animations'

// Module-level: motion.create() is stable and shouldn't re-run on render
const MotionLink = motion.create(Link)

const VARIANTS = {
  default: { bg: 'var(--color-amethyst-400)', text: 'text-amethyst-950', height: 'h-11', border: '' },
  dark:    { bg: 'var(--color-amethyst-700)', text: 'text-amethyst-100', height: 'h-11', border: '' },
  ghost:   { bg: 'transparent',               text: 'text-white',        height: 'h-9',  border: '' },
}

export default function SpotlightButton({ href, children, onClick, variant = 'default', className = '' }) {
  const ref = useRef(null)

  const onMouseMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  const v = VARIANTS[variant] ?? VARIANTS.default
  const baseClass = `relative inline-flex items-center justify-center rounded-[8px] px-4 ${v.height} btn-label ${v.text} ${v.border} overflow-hidden select-none no-underline ${className}`
  const baseStyle = { background: v.bg }

  const spotlight = (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 transition-opacity duration-300"
      style={{ background: 'radial-gradient(circle 80px at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.3), transparent)' }}
    />
  )

  if (href) {
    return (
      <MotionLink
        ref={ref}
        href={href}
        onMouseMove={onMouseMove}
        whileTap={{ scale: 0.96 }}
        transition={SPRING_SNAP}
        className={baseClass}
        style={baseStyle}
      >
        {spotlight}
        <span className="relative z-10">{children}</span>
      </MotionLink>
    )
  }

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={onMouseMove}
      whileTap={{ scale: 0.96 }}
      transition={SPRING_SNAP}
      className={baseClass}
      style={{ ...baseStyle, border: 'none', font: 'inherit' }}
    >
      {spotlight}
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}
