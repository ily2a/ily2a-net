'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useButtonState } from '@/hooks/useButtonState'

const STATES = ['default', 'hover', 'pressed']

export default function Logo({ isMobile = false, onClick }) {
  const router = useRouter()
  const { state, handlers } = useButtonState({ isMobile })
  // Navigate to home by default; parent can override with an onClick prop.
  const handleClick = onClick ?? (() => router.push('/'))

  return (
    <motion.button
      onClick={handleClick}
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
        // SVGs don't benefit from Next.js image optimisation; unoptimized skips
        // the image pipeline while still using the <Image> component API.
        <Image
          key={s}
          src={`/assets/logo-${s}.svg`}
          alt="ily2a"
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
