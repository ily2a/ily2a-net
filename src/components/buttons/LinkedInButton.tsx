'use client'

import { m } from 'framer-motion'
import { useButtonState, type ButtonState } from '@/hooks/useButtonState'
import { SPRING_SNAP } from '@/constants/animations'

interface LinkedInButtonStyle {
  borderColor: string
  background: string
  iconColor: string
  boxShadow: string
}

const states: Record<ButtonState, LinkedInButtonStyle> = {
  default: {
    borderColor: 'transparent',
    background:  'transparent',
    iconColor:   'var(--color-amethyst-400)',
    boxShadow:   'none',
  },
  hover: {
    borderColor: 'var(--color-amethyst-300)',
    background:  'transparent',
    iconColor:   'var(--color-amethyst-200)',
    boxShadow:   'none',
  },
  pressed: {
    borderColor: 'var(--color-amethyst-50)',
    background:  'var(--color-surface)',
    iconColor:   'var(--color-amethyst-50)',
    boxShadow:   'inset -4px 0px 4px var(--color-amethyst-950), inset 4px 0px 4px var(--color-amethyst-950), inset 0px -4px 4px var(--color-amethyst-950), inset 0px 4px 4px var(--color-amethyst-950)',
  },
}

function LinkedInIcon({ color, size = 28 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

export default function LinkedInButton() {
  const { state, handlers } = useButtonState()

  return (
    <m.a
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
      className="inline-flex items-center justify-center shrink-0 h-11 w-11 rounded-[8px] border border-transparent"
    >
      <LinkedInIcon color={states[state].iconColor} size={22} />
    </m.a>
  )
}
