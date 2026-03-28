'use client'

import { motion } from 'framer-motion'
import { useButtonState } from '@/hooks/useButtonState'
import { SPRING_SNAP, SPRING_ENTRANCE, HERO_BUTTON_DELAY } from '@/constants/animations'

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
    boxShadow:  'inset 0px 3px 3px #000, inset 0px -3px 3px #000, inset -3px 0px 3px #000, inset 3px 0px 3px #000',
  },
}

export default function TestimonialsButton() {
  const { state, handlers } = useButtonState()

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SPRING_ENTRANCE, delay: HERO_BUTTON_DELAY }}
      onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })}
      {...handlers}
      aria-label="View testimonials"
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '8px',
        width:          'auto',
        height:         '56px',
        borderRadius:   '8px',
        background:     'rgba(13, 16, 18, 0.25)',
        cursor:         'pointer',
        border:         'none',
      }}
    >
      <motion.div
        initial={INNER_STYLES.default}
        animate={INNER_STYLES[state]}
        transition={SPRING_SNAP}
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          width:          '100%',
          height:         '100%',
          borderRadius:   '8px',
          padding:        '0 16px',
        }}
      >
        <span className="btn-label" style={{ color: 'var(--color-text-primary)' }}>
          Echoes about me
        </span>
      </motion.div>
    </motion.button>
  )
}
