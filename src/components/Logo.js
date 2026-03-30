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
      className="cursor-pointer inline-flex shrink-0 relative w-16 h-8 bg-transparent border-0 p-0"
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
          className={`block inset-0 pointer-events-none transition-opacity duration-[80ms] ${s === 'default' ? 'relative' : 'absolute'} ${state === s ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
    </motion.button>
  )
}
