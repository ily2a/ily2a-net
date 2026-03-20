'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { useButtonState } from '@/hooks/useButtonState'
import { SPRING_SNAP } from '@/constants/animations'

const states = {
  default: {
    background:  'var(--color-amethyst-50)',
    borderColor: 'var(--color-amethyst-700)',
    boxShadow:   'none',
    fill:        'var(--color-amethyst-700)',
  },
  hover: {
    background:  'var(--color-amethyst-200)',
    borderColor: 'var(--color-amethyst-900)',
    boxShadow:   'none',
    fill:        'var(--color-amethyst-900)',
  },
  pressed: {
    background:  'var(--color-amethyst-700)',
    borderColor: 'var(--color-amethyst-50)',
    boxShadow:   'inset 0px -3px 3px rgba(0,0,0,0.25), inset 0px 2px 3px rgba(0,0,0,0.25)',
    fill:        'var(--color-amethyst-50)',
  },
}

const CloseButton = forwardRef(function CloseButton({ onClick }, ref) {
  const { state, handlers } = useButtonState()

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      {...handlers}
      animate={{
        background:  states[state].background,
        borderColor: states[state].borderColor,
        boxShadow:   states[state].boxShadow,
      }}
      transition={SPRING_SNAP}
      aria-label="Close"
      style={{
        // 44×44 touch target, 32×32 visual — padding makes up the difference
        width:     '44px',
        height:    '44px',
        minWidth:  '44px',
        minHeight: '44px',
        borderRadius: '8px',
        border:    '2px solid',
        display:   'flex',
        alignItems:     'center',
        justifyContent: 'center',
        cursor:    'pointer',
        padding:   '6px',
        flexShrink: 0,
        position:  'relative',
        overflow:  'hidden',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M18.1161 4.11612C18.6043 3.62796 19.3955 3.62796 19.8837 4.11612C20.3719 4.60427 20.3719 5.39554 19.8837 5.88369L13.7675 11.9999L19.8837 18.1161C20.3719 18.6043 20.3719 19.3955 19.8837 19.8837C19.3955 20.3719 18.6043 20.3719 18.1161 19.8837L11.9999 13.7675L5.88369 19.8837C5.39554 20.3719 4.60427 20.3719 4.11612 19.8837C3.62796 19.3955 3.62796 18.6043 4.11612 18.1161L10.2323 11.9999L4.11612 5.88369C3.62796 5.39554 3.62796 4.60427 4.11612 4.11612C4.60427 3.62796 5.39554 3.62796 5.88369 4.11612L11.9999 10.2323L18.1161 4.11612Z"
          fill={states[state].fill}
        />
      </svg>
    </motion.button>
  )
})

export default CloseButton
