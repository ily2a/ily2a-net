'use client'

// Which button pattern to use (src/components/buttons/):
//   • Spotlight CTA (radial cursor glow on a filled pill) → SpotlightButton
//     (this file), optionally wrapped in a named component for a fixed call site
//     (e.g. HomeButton, ViewAllProjectsButton).
//   • Icon / nav toggle with discrete default/hover/pressed states → useButtonState
//     + a `states` style map (e.g. NavbarButton, CloseButton, LinkedInButton).
//   • One-off visual treatment that none of the above expresses (conic gradient,
//     ripple, embedded modal) → bespoke component (e.g. ContactButton,
//     MobileContactButton, BookingButton).

import { m } from 'framer-motion'
import Link from 'next/link'
import { SPRING_SNAP } from '@/constants/animations'
import { useSpotlight } from '@/hooks/useSpotlight'
import SpotlightLayer from '@/components/effects/SpotlightLayer'

// Module-level: m.create() is stable and shouldn't re-run on render
const MotionLink = m.create(Link)

// SpotlightLayer takes no props, so its element is constant — build it once at
// module scope instead of rebuilding the JSX on every render.
const SPOTLIGHT = <SpotlightLayer />

const VARIANTS = {
  default: { bg: 'var(--color-amethyst-400)', text: 'text-amethyst-950', height: 'h-11' },
  dark:    { bg: 'var(--color-amethyst-700)', text: 'text-amethyst-100', height: 'h-11' },
}

export default function SpotlightButton({ href, children, onClick, variant = 'default', className = '' }) {
  const { ref, onMouseMove } = useSpotlight()

  const v = VARIANTS[variant] ?? VARIANTS.default
  const baseClass = `relative inline-flex items-center justify-center rounded-[8px] px-4 ${v.height} btn-label ${v.text} overflow-hidden select-none no-underline ${className}`
  const baseStyle = { background: v.bg }

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
        {SPOTLIGHT}
        <span className="relative z-10">{children}</span>
      </MotionLink>
    )
  }

  return (
    <m.button
      type="button"
      ref={ref}
      onClick={onClick}
      onMouseMove={onMouseMove}
      whileTap={{ scale: 0.96 }}
      transition={SPRING_SNAP}
      className={baseClass}
      style={{ ...baseStyle, border: 'none', font: 'inherit' }}
    >
      {SPOTLIGHT}
      <span className="relative z-10">{children}</span>
    </m.button>
  )
}
