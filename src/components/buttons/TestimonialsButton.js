'use client'

import { motion } from 'framer-motion'
import { SPRING_ENTRANCE, HERO_BUTTON_DELAY, HOVER_LIFT } from '@/constants/animations'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useWindowWidth } from '@/hooks/useWindowWidth'
import { scrollToElement } from '@/lib/scroll'

export default function TestimonialsButton({ instant = false }) {
  const prefersReduced = usePrefersReducedMotion()
  const width          = useWindowWidth()
  const isMobile       = width > 0 && width < 810

  return (
    <motion.button
      initial={instant ? false : { opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ ...HOVER_LIFT, borderColor: 'var(--color-border-hover)' }}
      whileTap={isMobile ? { scale: 0.96 } : { y: 0 }}
      transition={{ ...SPRING_ENTRANCE, delay: instant ? 0 : HERO_BUTTON_DELAY }}
      onClick={() =>
        scrollToElement(document.getElementById('testimonials'), prefersReduced)
      }
      style={{
        background:  'var(--color-surface-blur)',
        borderColor: 'var(--color-glass-border)',
      }}
      className="inline-flex items-center justify-center h-11 px-4 rounded-[8px] cursor-pointer border border-solid text-text-primary backdrop-blur-md"
    >
      <span className="btn-label leading-none">Echoes about me</span>
    </motion.button>
  )
}
