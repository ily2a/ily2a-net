'use client'

import { useRef, useEffect, type AriaAttributes, type CSSProperties } from 'react'
import { m, animate, type AnimationPlaybackControls } from 'framer-motion'
import { SPRING_SNAP, EASE_OUT } from '@/constants/animations'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface ContactButtonProps {
  label?: string
  onClick?: () => void
  'aria-current'?: AriaAttributes['aria-current']
}

export default function ContactButton({ label = 'Contact', onClick, 'aria-current': ariaCurrent }: ContactButtonProps) {
  const buttonRef      = useRef<HTMLButtonElement>(null)
  const animRef        = useRef<AnimationPlaybackControls | null>(null)
  const angleRef       = useRef(62)
  const prefersReduced = usePrefersReducedMotion()

  // Cleanup-only effect; animRef is a ref and needs no dependency.
  // react-doctor-disable-next-line react-doctor/exhaustive-deps
  useEffect(() => {
    return () => { animRef.current?.stop() }
  }, [])

  const animateTo = (targetAngle: number) => {
    if (prefersReduced) return
    animRef.current?.stop()
    animRef.current = animate(angleRef.current, targetAngle, {
      duration: 0.4,
      ease: EASE_OUT,
      onUpdate: (v) => {
        angleRef.current = v
        // Write directly to a CSS variable — avoids React re-renders at 60fps
        buttonRef.current?.style.setProperty('--ca', `${v % 360}deg`)
      },
    })
  }

  const handleMouseEnter = () => animateTo(224)
  const handleMouseLeave = () => animateTo(62)

  const layerClass = 'absolute inset-0 rounded-[8px] overflow-hidden pointer-events-none'
  const gradient   = 'conic-gradient(from var(--ca, 62deg), transparent 249deg, var(--color-amethyst-400) 249.6deg)'

  return (
    <m.button
      ref={buttonRef}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial="rest"
      whileHover={prefersReduced ? undefined : "hover"}
      whileTap={{ scale: 0.96 }}
      transition={SPRING_SNAP}
      // Visible label span below carries the accessible name — adding aria-label
      // here would override the visible text and drift if either changes.
      aria-current={ariaCurrent}
      className="relative inline-flex items-center justify-center p-0 w-[104px] h-11 rounded-[8px] overflow-visible select-none shrink-0 appearance-none border-0 bg-transparent"
      style={{
        '--ca': '62deg',
        font: 'inherit',
        WebkitTapHighlightColor: 'transparent',
      } as CSSProperties}
    >
      <div className={`${layerClass} bg-surface`} />
      {/* Gradient layers fade in on hover via Framer Motion variants */}
      <m.div
        variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
        className={layerClass}
        style={{ background: gradient }}
      />
      <m.div
        variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
        className={`${layerClass} blur`}
        style={{ background: gradient }}
      />
      <m.div
        variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
        className={`${layerClass} rotate-180`}
        style={{ background: gradient }}
      />
      <m.div
        variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
        className={`${layerClass} blur rotate-180`}
        style={{ background: gradient }}
      />
      <div className="absolute rounded-[7px] [inset:1px] bg-gradient-to-b from-surface to-background" />
      <span className="btn-label relative z-[1] pointer-events-none text-text-primary">
        {label}
      </span>
    </m.button>
  )
}
