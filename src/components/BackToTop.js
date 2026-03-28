'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SPRING_SNAP } from '@/constants/animations'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const onMouseMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          ref={ref}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          onMouseMove={onMouseMove}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          whileTap={{ scale: 0.96 }}
          transition={SPRING_SNAP}
          aria-label="Back to top"
          className="fixed bottom-[120px] right-4 lg:bottom-6 lg:right-6 z-50 inline-flex items-center justify-center gap-2 rounded-[8px] w-10 h-10 lg:w-auto lg:px-4 lg:h-11 btn-label text-amethyst-100 overflow-hidden select-none border-none cursor-pointer"
          style={{ background: 'var(--color-amethyst-900)' }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{ background: 'radial-gradient(circle 80px at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.3), transparent)' }}
          />
          <svg className="relative z-10" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
          <span className="relative z-10 hidden lg:inline">Back to top</span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
