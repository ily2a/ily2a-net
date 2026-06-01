'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { SPRING_SNAP } from '@/constants/animations'
import { useSpotlight } from '@/hooks/useSpotlight'
import SpotlightLayer from '@/components/SpotlightLayer'

// Module-level: motion.create() is stable and shouldn't re-run on render
const MotionLink = motion.create(Link)

const VARIANTS = {
  default: { bg: 'var(--color-amethyst-400)', text: 'text-amethyst-950', height: 'h-11', border: '' },
  dark:    { bg: 'var(--color-amethyst-700)', text: 'text-amethyst-100', height: 'h-11', border: '' },
  ghost:   { bg: 'transparent',               text: 'text-text-primary', height: 'h-9',  border: '' },
}

export default function SpotlightButton({ href, children, onClick, variant = 'default', className = '' }) {
  const { ref, onMouseMove } = useSpotlight()

  const v = VARIANTS[variant] ?? VARIANTS.default
  const baseClass = `relative inline-flex items-center justify-center rounded-[8px] px-4 ${v.height} btn-label ${v.text} ${v.border} overflow-hidden select-none no-underline ${className}`
  const baseStyle = { background: v.bg }

  const spotlight = <SpotlightLayer />

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
      type="button"
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
