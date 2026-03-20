'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Script from 'next/script'
import BookingButton from '@/components/BookingButton'
import TestimonialsButton from '@/components/TestimonialsButton'
import Navbar from '@/components/Navbar'
import TextReveal from '@/components/TextReveal'
import { useWindowWidth } from '@/hooks/useWindowWidth'

function UnicornBackground() {
  const ref = useRef(null)

  useEffect(() => {
    return () => {
      window.UnicornStudio?.destroy()
    }
  }, [])

  return (
    <>
      <Script
        src="https://cdn.unicorn.studio/v1.2.7/unicornStudio.umd.js"
        strategy="lazyOnload"
        onLoad={() => {
          if (ref.current) {
            ref.current.setAttribute('data-us-project', 'jPCt1BfDdfev5JLLP1hd')
            window.UnicornStudio?.init()
          }
        }}
      />
      <div
        ref={ref}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.65 }}
      />
    </>
  )
}

export default function HeroSection() {
  const width = useWindowWidth()
  const isMobile = width > 0 && width <= 600

  return (
    <>
      <section className="hero-section">
        <UnicornBackground />
        <div className="hero-container">
          <div style={{
            width: '100%',
            maxWidth: '680px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}>
            <h1 className="hero-heading">Ily Ameur</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <TextReveal
                text="Design Engineer : I design systems, flows, and products. Then build them."
                className="hero-sub-1"
              />
              <TextReveal
                text="End-to-end product design with zero handoff friction."
                className="text-md"
                scale={2}
                initialDelay={3.5}
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
        transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 1.5, delay: 6.5 }}
        style={{
          position: 'fixed',
          bottom: '32px',
          left: '50%',
          zIndex: 50,
          willChange: 'transform',
        }}
      >
        <Navbar mobile={isMobile} />
      </motion.div>
    </>
  )
}
