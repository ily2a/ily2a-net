'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { m } from 'motion/react'
import dynamic from 'next/dynamic'
import BookingButton from '@/components/booking/BookingButton'
import SocialLinkButton from '@/components/buttons/SocialLinkButton'
import CopyEmailButton from '@/components/buttons/CopyEmailButton'
import TestimonialsBg from '@/components/backgrounds/TestimonialsBg'
import { fadeUp } from '@/constants/animations'
import { AMETHYST } from '@/constants/tokens'
import { LINKEDIN_URL, X_URL } from '@/constants/site'

const EMAIL = 'ily.a.ameur@gmail.com'

const ContactBg = dynamic(() => import('@/components/backgrounds/ContactBg'), { ssr: false })

// Stable reference — ContactBg guards color re-parsing on reference equality.
const AURORA_STOPS = [AMETHYST[950], AMETHYST[600], AMETHYST[400]]

function DetailRow({ label, children, action }: { label: string; children: ReactNode; action: ReactNode }) {
  return (
    <div className="flex flex-col pb-1 border-b border-glass-border last:border-b-0">
      <span className="text-caption text-text-secondary">{label}</span>
      <div className="flex items-center justify-between gap-3">
        {children}
        {action}
      </div>
    </div>
  )
}

export default function ContactSection() {
  // Avoid a build-time-baked year drifting after New Year. Initial render uses
  // the render-time year (matches the static HTML at first paint); the effect
  // corrects it to the live year post-hydration. suppressHydrationWarning covers
  // the one case where a tab is open across the year boundary.
  const [year, setYear] = useState(() => new Date().getFullYear())
  // Post-mount sync of a value that legitimately differs between the build-time
  // server render and the client (same pattern as usePrefersReducedMotion).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setYear(new Date().getFullYear()) }, []) // react-doctor-disable-line react-doctor/no-initialize-state

  return (
    <section id="contact" tabIndex={-1} className="outline-none w-full relative overflow-hidden flex justify-center px-5 pt-7 pb-[124px] tab:px-10 tab:pt-8 desk:px-14 desk:pt-10 xl:px-20">
      {/* ── WebGL background (shared with Testimonials) ── */}
      <div className="absolute inset-0 opacity-15">
        <TestimonialsBg />
      </div>

      <div className="w-full max-w-[600px] relative z-[1] flex flex-col gap-5 tab:gap-8 tab:max-w-none xl:max-w-[1440px]">

        {/* ── Full-width header ── */}
        <m.div className="flex flex-col gap-2" {...fadeUp(0)}>
          <h2 className="heading-section text-text-primary">Contact</h2>
          <p className="text-md text-text-secondary">
            Open to Design Engineer roles and contract work. Remote, worldwide.
          </p>
        </m.div>

        {/* ── Contact card ── */}
        <m.div
          className="relative flex flex-col gap-10 rounded-glass p-6 tab:p-10 desk:flex-row desk:items-center desk:justify-between desk:p-14 overflow-hidden bg-glass-bg backdrop-blur-[32px] backdrop-saturate-[180%] border border-glass-border"
          style={{ boxShadow: 'var(--shadow-glass-card)' }}
          {...fadeUp(0.1)}
        >
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <ContactBg colorStops={AURORA_STOPS} amplitude={1.2} blend={0.6} speed={0.5} />
          </div>

          {/* Copy + CTA */}
          <div className="relative flex flex-col gap-8 desk:max-w-[620px]">
            <p className="heading-page text-text-primary">Bring the problem everyone&apos;s avoiding.</p>
            <div>
              <BookingButton static className="w-full desk:w-auto" />
            </div>
          </div>

          {/* Details */}
          <div className="relative flex flex-col gap-3 w-full desk:w-[320px] desk:shrink-0">
            <DetailRow label="Email" action={<CopyEmailButton email={EMAIL} />}>
              <a href={`mailto:${EMAIL}`} className="flex-1 min-w-0 self-stretch flex items-center text-body-strong text-text-primary">
                <span className="truncate">
                {EMAIL}</span>
              </a>
            </DetailRow>
            <DetailRow label="LinkedIn" action={<SocialLinkButton network="linkedin" />}>
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="flex-1 self-stretch flex items-center text-body-strong text-text-primary">
                @ily2a
              </a>
            </DetailRow>
            <DetailRow label="X" action={<SocialLinkButton network="x" />}>
              <a href={X_URL} target="_blank" rel="noopener noreferrer" className="flex-1 self-stretch flex items-center text-body-strong text-text-primary">
                @Ily_2A
              </a>
            </DetailRow>
          </div>
        </m.div>

        {/* ── Copyright ── */}
        <m.p
          className="text-center text-md pt-5 text-brand"
          suppressHydrationWarning
          {...fadeUp(0.2)}
        >
          © {year} Ily Ameur. All rights reserved.
        </m.p>

      </div>
    </section>
  )
}
