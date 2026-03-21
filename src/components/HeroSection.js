'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import BookingButton from '@/components/BookingButton'
import TestimonialsButton from '@/components/TestimonialsButton'
import Navbar from '@/components/Navbar'
import TextReveal from '@/components/TextReveal'
import dynamic from 'next/dynamic'

const GradientBlinds = dynamic(() => import('@/components/GradientBlinds'), {
  ssr: false,
  // CSS gradient mirrors the HERO_COLORS palette so the background fades in
  // gracefully while WebGL context initialises (avoids a flash to black).
  loading: () => (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(135deg, #2e2937 0%, #6c6284 40%, #b2adc7 75%, #cbc9da 100%)',
    }} />
  ),
})
import { useWindowWidth } from '@/hooks/useWindowWidth'
import { SPRING_NAV, HERO_NAV_DELAY, HERO_SUBTITLE_DELAY } from '@/constants/animations'
import { BREAKPOINTS } from '@/constants/layout'

// Site palette: amethyst-950 → amethyst-700 → amethyst-400 → near-white
const HERO_COLORS = ['#2e2937', '#6c6284', '#b2adc7', '#cbc9da']

function HeroBackground() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setVisible(true) }, [])
  return (
    <div
      aria-hidden="true"
      style={{
        position:   'absolute',
        inset:      0,
        width:      '100%',
        height:     '100%',
        opacity:    visible ? 0.5 : 0,
        transition: 'opacity 0.8s ease',
      }}
    >
      <GradientBlinds
        gradientColors={HERO_COLORS}
        angle={45}
        noise={0.14}
        blindCount={20}
        blindMinWidth={60}
        mouseDampening={0.2}
        spotlightRadius={0.6}
        spotlightSoftness={1.2}
        spotlightOpacity={0.8}
        mirrorGradient
        mixBlendMode="lighten"
        autoAnimate
        autoSpeed={0.35}
        attractRadius={0.35}
      />
    </div>
  )
}

export default function HeroSection({ children }) {
  const width    = useWindowWidth()
  const isMobile = width > 0 && width <= BREAKPOINTS.MOBILE

  return (
    <>
      <section id="hero" className="hero-section">
        <HeroBackground />
        <div className="hero-container">
          <div style={{ width: '100%', maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
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