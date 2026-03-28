'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, animate } from 'framer-motion'
import { SPRING_SNAP } from '@/constants/animations'

export default function ContactButton({ label = 'Contact', onClick }) {
  const [hovered, setHovered] = useState(false)
  const [angle, setAngle]     = useState(62)
  const animRef = useRef(null)

  useEffect(() => {
    return () => { animRef.current?.stop() }
  }, [])

  const animateTo = (from, targetAngle) => {
    animRef.current?.stop()
    animRef.current = animate(from, targetAngle, {
      duration: 0.4,
      ease: 'easeOut',
      onUpdate: setAngle,
    })
  }

  const handleMouseEnter = () => { setHovered(true);  animateTo(angle, 224) }
  const handleMouseLeave = () => { setHovered(false); animateTo(angle, 62)  }

  // Normalise angle to [0, 360) to prevent the value growing unbounded at 60fps
  const conicGradient = `conic-gradient(from ${angle % 360}deg, rgba(255,255,255,0) 249deg, var(--color-amethyst-400) 249.6deg)`
  const layerClass    = 'absolute inset-0 rounded-[8px] overflow-hidden'

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.96 }}
      transition={SPRING_SNAP}
      aria-label={label}
      className="relative inline-flex items-center justify-center p-0 w-[104px] h-11 rounded-[8px] overflow-visible select-none shrink-0 appearance-none border-0 bg-transparent"
      style={{
        font: 'inherit',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div className={`${layerClass} bg-surface`} />
      <div className={layerClass} style={{ background: conicGradient, opacity: hovered ? 1 : 0, transition: 'opacity 0.3s ease' }} />
      <div className={layerClass} style={{ background: conicGradient, filter: 'blur(8px)', opacity: hovered ? 1 : 0, transition: 'opacity 0.3s ease' }} />
      <div className={layerClass} style={{ background: conicGradient, transform: 'rotate(180deg)', opacity: hovered ? 1 : 0, transition: 'opacity 0.3s ease' }} />
      <div className={layerClass} style={{ background: conicGradient, filter: 'blur(8px)', transform: 'rotate(180deg)', opacity: hovered ? 1 : 0, transition: 'opacity 0.3s ease' }} />
      <div className="absolute rounded-[7px] [inset:1px] bg-gradient-to-b from-surface to-background" />
      <span className="btn-label relative z-[1] pointer-events-none text-text-primary">
        {label}
      </span>
    </motion.button>
  )
}
