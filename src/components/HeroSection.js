'use client'

import { useEffect, useState } from 'react'
import BookingButton from '@/components/BookingButton'
import TestimonialsButton from '@/components/TestimonialsButton'
import TextReveal from '@/components/TextReveal'
import dynamic from 'next/dynamic'

const GradientBlinds = dynamic(() => import('@/components/GradientBlinds'), {
  ssr: false,
  loading: () => (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(135deg, #2e2937 0%, #6c6284 40%, #b2adc7 75%, #cbc9da 100%)',
    }} />
  ),
})
import { HERO_SUBTITLE_DELAY } from '@/constants/animations'

const HERO_COLORS = ['#2e2937', '#6c6284', '#b2adc7', '#cbc9da']

function HeroBackground() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setVisible(true) }, [])
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full transition-opacity duration-[800ms] ease-[ease] ${visible ? 'opacity-50' : 'opacity-0'}`}
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
  return (
    <>
      <section id="hero" className="relative h-screen">
        <HeroBackground />
        <div className="relative z-10 flex justify-center pt-[120px] px-5 pb-7 md:pt-[88px] md:px-10 md:pb-6 lg:px-16 lg:pb-16">
          <div className="w-full max-w-[680px] flex flex-col gap-6">
            {children}
            <div className="flex flex-col gap-4">
              <TextReveal
                text="Design Engineer : I design systems, flows, and products. Then build them."
                className="font-medium tracking-[0.06em] leading-[140%] text-[24px] md:text-[28px] lg:text-[26px] xl:text-[32px] text-balance"
              />
              <TextReveal
                text="End-to-end product design with zero handoff friction."
                className="text-md"
                scale={2}
                initialDelay={HERO_SUBTITLE_DELAY}
              />
            </div>
            <div className="flex gap-3">
              <BookingButton />
              <TestimonialsButton />
            </div>
          </div>
        </div>
      </section>

    </>
  )
}
