'use client'

import { motion } from 'framer-motion'
import { useButtonState } from '@/hooks/useButtonState'
import { SPRING_SNAP, SPRING_ENTRANCE, HERO_BUTTON_DELAY } from '@/constants/animations'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { scrollToElement } from '@/lib/scroll'

// Defined at module level — same object reference on every render, so
// Framer Motion's `animate` never re-triggers on unchanged state.
const INNER_STYLES = {
  default: {
    background: 'linear-gradient(to bottom, var(--color-surface), var(--color-background))',
    border:     '1px solid var(--color-text-subtle)',
    boxShadow:  'none',
  },
  hover: {
    background: 'linear-gradient(to bottom, var(--color-surface), var(--color-background))',
    border:     '1px solid var(--color-amethyst-950)',
    boxShadow:  'none',
  },
  pressed: {
    background: 'linear-gradient(to bottom, var(--color-background), var(--color-surface))',
    border:     '1px solid var(--color-amethyst-900)',
    boxShadow:  'inset 0px 3px 3px var(--color-background), inset 0px -3px 3px var(--color-background), inset -3px 0px 3px var(--color-background), inset 3px 0px 3px var(--color-background)',
  },
}

export default function TestimonialsButton({ instant = false }) {
  const { state, handlers } = useButtonState()
  const prefersReduced = usePrefersReducedMotion()

  return (
    <motion.button
      initial={instant ? false : { opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SPRING_ENTRANCE, delay: instant ? 0 : HERO_BUTTON_DELAY }}
      onClick={() =>
        scrollToElement(document.getElementById('testimonials'), prefersReduced)
      }
      {...handlers}
      className="inline-flex items-center justify-center p-2 w-auto h-14 rounded-[8px] bg-background/15 cursor-pointer border-none"
    >
      <motion.div
        initial={INNER_STYLES.default}
        animate={INNER_STYLES[state]}
        transition={SPRING_SNAP}
        className="flex items-center justify-center w-full h-full rounded-[8px] px-4"
      >
        <span className="btn-label text-text-primary">
          Echoes about me
        </span>
      </motion.div>
    </motion.button>
  )
}
