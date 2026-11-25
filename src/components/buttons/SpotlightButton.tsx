'use client'

// Which button pattern to use (src/components/buttons/):
//   • Spotlight CTA (radial cursor glow on a filled pill) → SpotlightButton
//     (this file), optionally wrapped in a named component for a fixed call site
//     (e.g. HomeButton, ViewAllProjectsButton).
//   • Icon / nav toggle with discrete default/hover/pressed states → useButtonState
//     + a `states` style map (e.g. NavbarButton, CloseButton, LinkedInButton).
//   • One-off visual treatment that none of the above expresses (conic gradient,
//     ripple) → bespoke component (e.g. ContactButton, MobileContactButton).
//     The Cal.com booking trigger + modal lives in src/components/booking/.

import { m } from 'motion/react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { SPRING_SNAP } from '@/constants/animations'
import { useSpotlight } from '@/hooks/useSpotlight'
import SpotlightLayer from '@/components/effects/SpotlightLayer'

// Module-level: m.create() is stable and shouldn't re-run on render
const MotionLink = m.create(Link)

// SpotlightLayer takes no props, so its element is constant — build it once at
// module scope instead of rebuilding the JSX on every render.
const SPOTLIGHT = <SpotlightLayer />

type SpotlightVariant = 'default' | 'dark'

const VARIANTS: Record<SpotlightVariant, { bg: string; text: string }> = {
  default: { bg: 'var(--color-amethyst-400)', text: 'text-amethyst-950' },
  dark:    { bg: 'var(--color-amethyst-700)', text: 'text-amethyst-100' },
}

interface SpotlightButtonProps {
  href: string
  children: ReactNode
  variant?: SpotlightVariant
}

export default function SpotlightButton({ href, children, variant = 'default' }: SpotlightButtonProps) {
  const { ref, onMouseMove } = useSpotlight()
  const v = VARIANTS[variant]

  return (
    <MotionLink
      ref={ref}
      href={href}
      onMouseMove={onMouseMove}
      whileTap={{ scale: 0.97 }}
      transition={SPRING_SNAP}
      className={`relative inline-flex items-center justify-center rounded-pill px-4 h-11 btn-label ${v.text} overflow-hidden select-none no-underline`}
      style={{ background: v.bg }}
    >
      {SPOTLIGHT}
      <span className="relative z-10">{children}</span>
    </MotionLink>
  )
}
