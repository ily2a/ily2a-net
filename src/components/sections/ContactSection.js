'use client'

import { motion } from 'framer-motion'
import { ContactFormButton } from '@/components/buttons/ContactFormButton'
import BookingButton from '@/components/buttons/BookingButton'
import LinkedInButton from '@/components/buttons/LinkedInButton'
import { FloatingLabelInput, FloatingLabelTextarea } from '@/components/form/FloatingLabelInput'
import { useContactForm } from '@/hooks/useContactForm'
import { CONTACT_MAX } from '@/lib/validation'
import { fadeUp } from '@/constants/animations'
import dynamic from 'next/dynamic'

// Per-field, per-error-kind copy. Keeps the JSX below readable and
// guarantees every validation outcome maps to user-visible text.
const ERROR_COPY = {
  name: {
    required: 'Please enter your full name.',
    tooLong:  `Name is too long (max ${CONTACT_MAX.name} characters).`,
  },
  email: {
    required: 'Please enter your email.',
    invalid:  'Please enter a valid email.',
    tooLong:  `Email is too long (max ${CONTACT_MAX.email} characters).`,
  },
  message: {
    required: 'Please tell me how I can help.',
    tooLong:  `Message is too long (max ${CONTACT_MAX.message} characters).`,
  },
}

const Aurora = dynamic(() => import('@/components/backgrounds/Aurora'), { ssr: false })

// Stable reference — Aurora guards color re-parsing on reference equality,
// so an inline array literal would trigger re-parses on every form keystroke.
const AURORA_STOPS = ['#2e2937', '#8479a0', '#b2adc7']

export default function ContactSection() {
  const { form, errors, status, handleChange, handleSubmit, reset, resetError } = useContactForm()
  const submitLabel =
    status === 'sending' ? 'Sending…' :
    status === 'sent' ? 'Sent ✓' :
    'Submit'

  return (
    <section id="contact" className="w-full flex justify-center px-5 pt-7 pb-[124px] tab:px-10 tab:pt-8 desk:px-14 desk:pt-10 xl:px-20">
      <div className="w-full max-w-[600px] flex flex-col gap-5 tab:gap-8 tab:max-w-none xl:max-w-[1440px]">

        {/* ── Full-width header ── */}
        <motion.div className="flex flex-col gap-2" {...fadeUp(0)}>
          <h2 className="heading-section text-text-primary">Contact</h2>
          <p className="text-md text-text-secondary">
            Please fill out this form to get in touch, I&apos;m excited to hear about your ideas.
          </p>
        </motion.div>

        {/* ── Form (2/3) + About blurb (1/3) ── */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6 lg:gap-8">

          {/* Form */}
          <motion.form
            className="flex flex-col gap-4 w-full md:flex-[2] md:order-1 order-1"
            onSubmit={handleSubmit}
            noValidate
            {...fadeUp(0.1)}
          >
              {/* Name + Email row */}
              <div className="flex flex-col gap-3 md:flex-row">
                {/* Name */}
                <div className="flex flex-col gap-2 flex-1">
                  <FloatingLabelInput
                    id="name" name="name" label="Full name"
                    value={form.name} onChange={handleChange}
                    required autoComplete="name"
                    maxLength={CONTACT_MAX.name}
                    hasError={!!errors.name} errorId="name-error"
                  />
                  {errors.name && (
                    <p id="name-error" className="text-[12px] text-error">{ERROR_COPY.name[errors.name] ?? 'Please check this field.'}</p>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2 flex-1">
                  <FloatingLabelInput
                    id="email" name="email" label="Email" type="email"
                    value={form.email} onChange={handleChange}
                    required autoComplete="email"
                    maxLength={CONTACT_MAX.email}
                    hasError={!!errors.email} errorId="email-error"
                  />
                  {errors.email && (
                    <p id="email-error" className="text-[12px] text-error">{ERROR_COPY.email[errors.email] ?? 'Please check this field.'}</p>
                  )}
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2">
                <FloatingLabelTextarea
                  id="message" name="message" label="How can I help you?"
                  value={form.message} onChange={handleChange}
                  required rows={6}
                  maxLength={CONTACT_MAX.message}
                  hasError={!!errors.message} errorId="message-error"
                />
                {errors.message && (
                  <p id="message-error" className="text-[12px] text-error">{ERROR_COPY.message[errors.message] ?? 'Please check this field.'}</p>
                )}
              </div>

              <div className="mt-1">
                <ContactFormButton
                  type="submit"
                  className="w-full"
                  disabled={status === 'sending' || status === 'sent' || status === 'ratelimited'}
                >
                  <span aria-live="polite" aria-atomic="true">
                    {submitLabel}
                  </span>
                </ContactFormButton>
              </div>

              <div aria-live="polite" aria-atomic="true">
                {status === 'sent' && (
                  <div className="flex items-center gap-3">
                    <p className="text-[13px] text-text-secondary">Message sent successfully.</p>
                    <button
                      type="button"
                      onClick={reset}
                      className="text-[13px] underline text-brand"
                    >
                      Send another
                    </button>
                  </div>
                )}
                {status === 'error' && (
                  <div className="flex items-center gap-3">
                    <p className="text-[13px] text-error">
                      Something went wrong — please try again.
                    </p>
                    <button
                      type="button"
                      onClick={resetError}
                      className="text-[13px] underline text-error"
                    >
                      Retry
                    </button>
                  </div>
                )}
                {status === 'ratelimited' && (
                  <p className="text-[13px] text-error">
                    Too many submissions — please wait a while before trying again.
                  </p>
                )}
              </div>
          </motion.form>

          {/* About blurb */}
          <motion.div
            className="hidden lg:flex flex-col gap-3 w-full lg:flex-[1] lg:pt-[26px] order-2"
            {...fadeUp(0.15)}
          >
            <p className="text-body text-text-primary">
              I design systems, flows, and products. Then build them.
            </p>
            <p className="text-body text-text-primary">
              I work end-to-end across multiple industries. I own the full process: discovery, flows, design systems, high-fidelity prototypes, and handoff. Increasingly, I build what I design using React and React Native.
            </p>
            <p className="text-body text-text-primary">
              If you need a design engineer who thinks in systems and ships, let&apos;s talk.
            </p>
            <p className="text-body text-text-primary">
              Cheers, Ily
            </p>
          </motion.div>

        </div>

        {/* ── Info card ── */}
        <motion.div
          className="relative flex flex-row items-center justify-between rounded-[12px] p-4 md:py-5 md:px-10 overflow-hidden bg-glass-bg backdrop-blur-[32px] backdrop-saturate-[180%] border border-glass-border"
          style={{ boxShadow: 'var(--shadow-glass-card)' }}
          {...fadeUp(0.15)}
        >
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <Aurora
              colorStops={AURORA_STOPS}
              amplitude={1.2}
              blend={0.6}
              speed={0.5}
            />
          </div>

          <div className="relative flex flex-col gap-1">
            <p className="heading-display">Ily Ameur</p>
            <p className="text-md text-brand">Design Engineer</p>
          </div>
          <div className="relative flex flex-row items-center gap-3">
            <LinkedInButton />
            <BookingButton static />
          </div>
        </motion.div>

        {/* ── Copyright ── */}
        <motion.p
          className="text-center text-md pt-5 text-brand"
          {...fadeUp(0.2)}
        >
          © {new Date().getFullYear()} Ily Ameur. All rights reserved.
        </motion.p>

      </div>
    </section>
  )
}
