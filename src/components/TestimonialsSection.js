'use client'

import Image from 'next/image'
import dynamic from 'next/dynamic'
import { TESTIMONIALS } from '@/data/testimonials'

const DarkVeil = dynamic(() => import('@/components/DarkVeil'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-br from-background via-amethyst-950 to-amethyst-900" />
  ),
})


export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="w-full relative overflow-hidden flex justify-center px-4 py-7 tab:px-10 tab:py-8 desk:px-14 desk:py-10 xl:px-20"
    >
      {/* ── WebGL background ── */}
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

      {/* ── Content ── */}
      <div className="w-full max-w-[600px] relative z-[1] flex flex-col gap-5 tab:gap-8 tab:max-w-none xl:max-w-[1440px]">
        <div className="flex flex-col gap-2">
          <h2 className="heading-section text-text-primary">Echoes about me</h2>
          <p className="text-md text-text-secondary">
            While some of my client reviews are NDA-protected (because, you know, top-secret
            agency white label stuff), I managed to sneak in a few favorites from my previous partners.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 min-[600px]:grid-cols-2">
          {TESTIMONIALS.map(({ name, role, avatar, quote, wide }) => (
            <article
              key={name}
              className={`testimonial-card rounded-xl${wide ? ' col-span-full' : ''}`}
            >
              <div className="flex items-center gap-3">
                <Image
                  src={avatar}
                  alt={`${name}, ${role}`}
                  width={44}
                  height={44}
                  className="w-11 h-11 rounded-full object-cover shrink-0"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="text-testimonial-name text-text-primary">{name}</span>
                  <span className="text-testimonial-role text-text-secondary">{role}</span>
                </div>
              </div>
              <p className="text-body-card text-text-primary">{quote}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
