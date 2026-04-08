'use client'

import { motion } from 'framer-motion'
import BookingButton from '@/components/buttons/BookingButton'
import TestimonialsButton from '@/components/buttons/TestimonialsButton'
import TextReveal from '@/components/TextReveal'
import { useHeroIntroPlayed } from '@/hooks/useHeroIntroPlayed'
import dynamic from 'next/dynamic'

const GradientBlinds = dynamic(() => import('@/components/backgrounds/GradientBlinds'), {
  ssr: false,
  loading: () => (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(135deg, var(--color-amethyst-950) 0%, var(--color-amethyst-700) 40%, var(--color-amethyst-400) 75%, var(--color-amethyst-300) 100%)',
    }} />
  ),
})
import { HERO_SUBTITLE_DELAY } from '@/constants/animations'

// amethyst-950 / amethyst-700 / amethyst-400 / amethyst-300
const HERO_COLORS = ['#2e2937', '#6c6284', '#b2adc7', '#cbc9da']

function HeroBackground() {
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="absolute inset-0 w-full h-full"
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
    </motion.div>
  )
}

export default function HeroSection({ children }) {
  const introPlayed = useHeroIntroPlayed()

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
                className="text-intro"
                instant={introPlayed}
              />
              <TextReveal
                text="End-to-end product design with zero handoff friction."
                className="text-md"
                scale={2}
                initialDelay={HERO_SUBTITLE_DELAY}
                instant={introPlayed}
              />
            </div>
            <div className="flex gap-3">
              <BookingButton static={introPlayed} />
              <TestimonialsButton instant={introPlayed} />
            </div>
          </div>
        </div>
      </section>

    </>
  )
}
