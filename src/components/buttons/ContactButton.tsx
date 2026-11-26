'use client'

import { useRef, useEffect, type AriaAttributes, type CSSProperties } from 'react'
import { m, animate, type AnimationPlaybackControls } from 'motion/react'
import { SPRING_SNAP, EASE_OUT } from '@/constants/animations'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const LAYER_CLASS = 'absolute inset-0 rounded-pill overflow-hidden pointer-events-none'
const GRADIENT    = 'conic-gradient(from var(--ca, 62deg), transparent 249deg, var(--color-amethyst-400) 249.6deg)'
// The conic edge four times: sharp + blurred glow, each mirrored by rotate-180.
const GRADIENT_LAYERS = ['', 'blur', 'rotate-180', 'blur rotate-180']
const LAYER_VARIANTS   = { rest: { opacity: 0 }, hover: { opacity: 1 } }
const LAYER_TRANSITION = { duration: 0.3, ease: EASE_OUT }

interface ContactButtonProps {
  onClick?: () => void
  'aria-current'?: AriaAttributes['aria-current']
}

export default function ContactButton({ onClick, 'aria-current': ariaCurrent }: ContactButtonProps) {
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
      duration: 0.3,
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

  return (
    <m.button
      ref={buttonRef}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial="rest"
      whileHover={prefersReduced ? undefined : "hover"}
      whileTap={{ scale: 0.97 }}
      transition={SPRING_SNAP}
      // Visible label span below carries the accessible name — adding aria-label
      // here would override the visible text and drift if either changes.
      aria-current={ariaCurrent}
      className="relative inline-flex items-center justify-center p-0 w-[104px] h-11 rounded-pill overflow-visible select-none shrink-0 appearance-none border-0 bg-transparent"
      style={{
        '--ca': '62deg',
        font: 'inherit',
        WebkitTapHighlightColor: 'transparent',
      } as CSSProperties}
    >
      <div className={`${LAYER_CLASS} bg-surface`} />
      {/* Gradient layers fade in on hover via Motion variants */}
      {GRADIENT_LAYERS.map((extra) => (
        <m.div
          key={extra || 'base'}
          variants={LAYER_VARIANTS}
          transition={LAYER_TRANSITION}
          className={extra ? `${LAYER_CLASS} ${extra}` : LAYER_CLASS}
          style={{ background: GRADIENT }}
        />
      ))}
      <div className="absolute rounded-button-inset [inset:1px] bg-gradient-to-b from-surface to-background" />
      <span className="btn-label relative z-[1] pointer-events-none text-text-primary">
        Contact
      </span>
    </m.button>
  )
}
