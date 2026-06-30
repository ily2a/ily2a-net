'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { m } from 'framer-motion'
import { useButtonState, type ButtonState } from '@/hooks/useButtonState'

const STATES: ButtonState[] = ['default', 'hover', 'pressed']

interface LogoProps {
  isMobile?: boolean
  onClick?: () => void
}

export default function Logo({ isMobile = false, onClick }: LogoProps) {
  const router = useRouter()
  const { state, handlers } = useButtonState({ isMobile })
  // Navigate to home by default; parent can override with an onClick prop.
  const handleClick = onClick ?? (() => router.push('/'))

  return (
    <m.button
      onClick={handleClick}
      {...handlers}
      aria-label="ily2a home"
      className="cursor-pointer inline-flex shrink-0 relative w-16 h-8 bg-transparent border-0 p-0"
    >
      {STATES.map((s) => (
        // SVGs don't benefit from Next.js image optimisation; unoptimized skips
        // the image pipeline while still using the <Image> component API.
        // CSS transition is intentional here — m.div wrappers inside
        // m.button interfere with FM gesture detection on mobile.
        <Image
          key={s}
          src={`/assets/logo-${s}.svg`}
          alt=""
          aria-hidden="true"
          width={64}
          height={32}
          unoptimized
          className={`block inset-0 pointer-events-none transition-opacity duration-[80ms] ease-out ${s === 'default' ? 'relative' : 'absolute'} ${state === s ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
    </m.button>
  )
}
