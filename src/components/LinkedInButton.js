'use client'

import { motion } from 'framer-motion'
import { useButtonState } from '@/hooks/useButtonState'
import { useWindowWidth } from '@/hooks/useWindowWidth'
import { SPRING_SNAP } from '@/constants/animations'
import { BREAKPOINTS } from '@/constants/layout'

const states = {
  default: {
    borderColor: 'rgba(0,0,0,0)',
    background:  'rgba(0,0,0,0)',
    iconColor:   '#b2adc7',
    boxShadow:   'none',
  },
  hover: {
    borderColor: 'var(--color-amethyst-300)',
    background:  'rgba(0,0,0,0)',
    iconColor:   '#dedee8',
    boxShadow:   'none',
  },
  pressed: {
    borderColor: 'var(--color-amethyst-50)',
    background:  'var(--color-surface)',
    iconColor:   '#f6f6f9',
    boxShadow:   'inset -4px 0px 4px #2e2937, inset 4px 0px 4px #2e2937, inset 0px -4px 4px #2e2937, inset 0px 4px 4px #2e2937',
  },
}

function LinkedInIcon({ color, size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

export default function LinkedInButton() {
  const { state, handlers } = useButtonState()
  const width    = useWindowWidth()
  const isMobile = width > 0 && width <= BREAKPOINTS.MOBILE
  const size     = isMobile ? 36 : 60
  const iconSize = isMobile ? 18 : 28

  return (
    <motion.a
      href="https://linkedin.com/in/ily2a"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="LinkedIn profile"
      {...handlers}
      animate={{
        borderColor: states[state].borderColor,
        background:  states[state].background,
        boxShadow:   states[state].boxShadow,
      }}
      transition={SPRING_SNAP}
      className="inline-flex items-center justify-center shrink-0 rounded-[8px] border border-transparent"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <LinkedInIcon color={states[state].iconColor} size={iconSize} />
    </motion.a>
  )
}
