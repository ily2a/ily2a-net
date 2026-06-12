'use client'

import { useRef, useState, type AriaAttributes, type MouseEvent } from 'react'
import { m } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { SPRING_SNAP, EASE_OUT } from '@/constants/animations'

interface Ripple {
  x: number
  y: number
  size: number
  key: number
}

interface MobileContactButtonProps {
  label?: string
  onClick?: () => void
  'aria-current'?: AriaAttributes['aria-current']
}

export default function MobileContactButton({ label = 'Contact', onClick, 'aria-current': ariaCurrent }: MobileContactButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const buttonRef  = useRef<HTMLButtonElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  const triggerRipple = (x: number, y: number) => {
    if (prefersReduced) return
    const button = buttonRef.current
    if (!button) return
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const key  = Date.now()
    setRipples((prev) => [...prev, { x: x - rect.left - size / 2, y: y - rect.top - size / 2, size, key }])
  }

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    // e.detail === 0 means a keyboard-synthesized click (Enter/Space), which has
    // no pointer coordinates — ripple from the button center. Letting the native
    // button handle Space (no preventDefault/onKeyDown) keeps activation working;
    // the old keydown handler cancelled Space's click, drawing a ripple but never
    // navigating.
    if (e.detail === 0) {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (rect) triggerRipple(rect.left + rect.width / 2, rect.top + rect.height / 2)
    } else {
      triggerRipple(e.clientX, e.clientY)
    }
    onClick?.()
  }

  return (
    <m.button
      ref={buttonRef}
      onClick={handleClick}
      aria-current={ariaCurrent}
      whileTap={{ scale: 0.96 }}
      transition={SPRING_SNAP}
      className="relative inline-flex items-center justify-center w-full h-11 rounded-[8px] border border-glass-border bg-surface cursor-pointer overflow-hidden select-none"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <span className="btn-label relative z-[1] text-text-primary pointer-events-none">
        {label}
      </span>
      <span className="absolute inset-0 pointer-events-none">
        {!prefersReduced && ripples.map((ripple) => (
          <m.span
            key={ripple.key}
            initial={{ scale: 0.4, opacity: 0.35 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            onAnimationComplete={() => setRipples((prev) => prev.filter((r) => r.key !== ripple.key))}
            style={{
              position: 'absolute',
              width: `${ripple.size}px`,
              height: `${ripple.size}px`,
              top: `${ripple.y}px`,
              left: `${ripple.x}px`,
              borderRadius: '50%',
              backgroundColor: 'var(--color-amethyst-100)',
            }}
          />
        ))}
      </span>
    </m.button>
  )
}
