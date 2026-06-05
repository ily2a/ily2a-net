'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import BookingButton from '@/components/buttons/BookingButton'
import TestimonialsButton from '@/components/buttons/TestimonialsButton'
import TextReveal from '@/components/effects/TextReveal'
import { useHeroIntroPlayed } from '@/hooks/useHeroIntroPlayed'
import { AMETHYST } from '@/constants/colors'
import HeroBg from '@/components/backgrounds/HeroBg'
import { HERO_SUBTITLE_DELAY, EASE_OUT } from '@/constants/animations'

const HERO_COLORS = [AMETHYST[950], AMETHYST[700], AMETHYST[400], AMETHYST[300]]

function HeroBackground() {
  const [bgReady, setBgReady] = useState(false)

  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      className="absolute inset-0 w-full h-full"
    >
      <HeroBg
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
        onFirstFrame={() => setBgReady(true)}
      />
      {/* Gradient placeholder sits ON TOP of the canvas as a normal-alpha
          overlay (not a lighten backdrop) so it crossfades away to reveal the
          canvas without the additive brightness spike that caused a load flash.
          pointer-events-none so it never intercepts the mouse — otherwise this
          decorative layer (still in the DOM at opacity 0) blocks the canvas from
          receiving pointermove, freezing the spotlight's mouse attraction. */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: bgReady ? 0 : 1 }}
        transition={{ duration: 0.24, ease: EASE_OUT }}
        style={{
          background:
            'linear-gradient(135deg, var(--color-amethyst-950) 0%, var(--color-amethyst-700) 40%, var(--color-amethyst-400) 75%, var(--color-amethyst-300) 100%)',
        }}
      />
    </motion.div>
  )
}

export default function HeroSection({ children }) {
  const introPlayed = useHeroIntroPlayed()

  return (
    <section id="hero" tabIndex={-1} className="relative h-screen outline-none">
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
  )
}
