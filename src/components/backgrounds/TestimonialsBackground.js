'use client'

import dynamic from 'next/dynamic'

const DarkVeil = dynamic(() => import('@/components/backgrounds/DarkVeil'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-br from-background via-amethyst-950 to-amethyst-900" />
  ),
})

export default function TestimonialsBackground() {
  return (
    <div aria-hidden="true" className="absolute inset-0 z-0">
      <DarkVeil
        hueShift={0}
        speed={0.3}
        warpAmount={0.6}
        noiseIntensity={0.025}
        scanlineIntensity={0}
        resolutionScale={0.6}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-amethyst-950 via-amethyst-700 to-amethyst-900 mix-blend-color" />
      <div className="absolute inset-0 bg-background/30" />
    </div>
  )
}
