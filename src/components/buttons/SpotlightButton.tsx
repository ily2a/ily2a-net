'use client'

// Which button pattern to use (src/components/buttons/):
//   • Spotlight CTA (radial cursor glow on a filled pill) → SpotlightButton
//     (this file), optionally wrapped in a named component for a fixed call site
//     (e.g. HomeButton, ViewAllProjectsButton). It is link-only (href required);
//     for an action, build an m.button from useSpotlight + SpotlightLayer as
//     BackToTop does.
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

const VARIANTS: Record<SpotlightVariant, string> = {
  default: 'bg-amethyst-400 text-amethyst-950',
  dark:    'bg-amethyst-700 text-amethyst-100',
}

interface SpotlightButtonProps {
  href: string
  children: ReactNode
  variant?: SpotlightVariant
}

export default function SpotlightButton({ href, children, variant = 'default' }: SpotlightButtonProps) {
  const { ref, onMouseMove } = useSpotlight()
  return (
    <MotionLink
      ref={ref}
      href={href}
      onMouseMove={onMouseMove}
      whileTap={{ scale: 0.97 }}
      transition={SPRING_SNAP}
      className={`relative inline-flex items-center justify-center rounded-pill px-4 h-11 btn-label ${VARIANTS[variant]} overflow-hidden select-none no-underline`}
    >
      {SPOTLIGHT}
      <span className="relative z-10">{children}</span>
    </MotionLink>
  )
}
