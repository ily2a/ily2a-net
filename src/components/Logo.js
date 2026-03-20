'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useButtonState } from '@/hooks/useButtonState'

const STATES = ['default', 'hover', 'pressed']

export default function Logo({ isMobile = false, onClick }) {
  const { state, handlers } = useButtonState({ isMobile })

  return (
    <motion.button
      onClick={onClick}
      {...handlers}
      aria-label="ily2a home"
      style={{
        cursor:   'pointer',
        display:  'inline-flex',
        flexShrink: 0,
        position: 'relative',
        width:    64,
        height:   32,
        background: 'none',
        border:   'none',
        padding:  0,
      }}
    >
      {STATES.map((s) => (
        <Image
          key={s}
          src={`/assets/logo-${s}.svg`}
          alt={s === 'default' ? 'ily2a' : ''}
          width={64}
          height={32}
          unoptimized
          style={{
            display:  'block',
            position: s === 'default' ? 'relative' : 'absolute',
            inset:    0,
            opacity:  state === s ? 1 : 0,
            transition: 'opacity 0.08s ease',
            pointerEvents: 'none',
          }}
        />
      ))}
    </motion.button>
  )
}
