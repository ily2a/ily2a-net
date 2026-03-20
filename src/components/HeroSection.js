'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Script from 'next/script'
import { motion } from 'framer-motion'
import BookingButton from '@/components/BookingButton'
import TestimonialsButton from '@/components/TestimonialsButton'
import Navbar from '@/components/Navbar'
import TextReveal from '@/components/TextReveal'
import { useWindowWidth } from '@/hooks/useWindowWidth'
import { SPRING_NAV, HERO_NAV_DELAY, HERO_SUBTITLE_DELAY } from '@/constants/animations'

const UNICORN_SRC = 'https://cdn.unicorn.studio/v1.2.7/unicornStudio.umd.js'

function UnicornBackground() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  const init = useCallback(() => {
    if (ref.current) {
      ref.current.setAttribute('data-us-project', 'jPCt1BfDdfev5JLLP1hd')
      window.UnicornStudio?.init()
      requestAnimationFrame(() => setVisible(true))
    }
  }, [])

  useEffect(() => {
    // If next/script already loaded the script on a previous render (e.g. back-navigation), init immediately
    if (window.UnicornStudio) init()
    return () => { window.UnicornStudio?.destroy() }
  }, [init])

  return (
    <>
      <Script
        src={UNICORN_SRC}
        strategy="afterInteractive"
        onLoad={init}
        onError={() => { /* script failed — background stays invisible, no layout impact */ }}
      />
      <div
        ref={ref}
        style={{
          position:   'absolute',
          inset:      0,
          width:      '100%',
          height:     '100%',
          opacity:    visible ? 0.65 : 0,
          transition: 'opacity 0.8s ease',
        }}
      />
    </>
  )
}

export default function HeroSection({ children }) {
  const width    = useWindowWidth()
  const isMobile = width > 0 && width <= 600

  return (
    <>
      <section className="hero-section">
        <UnicornBackground />
        <div className="hero-container">
          <div style={{
            width:         '100%',
            maxWidth:      '680px',
            display:       'flex',
            flexDirection: 'column',
            gap:           '24px',
          }}>
            {children}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <TextReveal
                text="Design Engineer : I design systems, flows, and products. Then build them."
                className="hero-sub-1"
              />
              <TextReveal
                text="End-to-end product design with zero handoff friction."
                className="text-md"
                scale={2}
                initialDelay={HERO_SUBTITLE_DELAY}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BookingButton />
              <TestimonialsButton />
            </div>
          </div>
        </div>
      </section>

      <motion.div
        initial={{ opacity: 0, y: 150, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        transition={{ ...SPRING_NAV, delay: HERO_NAV_DELAY }}
        style={{
          position:   'fixed',
          bottom:     '32px',
          left:       '50%',
          zIndex:     50,
          willChange: 'transform',
        }}
      >
        <Navbar isMobile={isMobile} />
      </motion.div>
    </>
  )
}
