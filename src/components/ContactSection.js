'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ContactFormButton } from '@/components/ContactFormButton'
import BookingButton from '@/components/BookingButton'
import LinkedInButton from '@/components/LinkedInButton'
import dynamic from 'next/dynamic'

const Aurora = dynamic(() => import('@/components/Aurora'), { ssr: false })


const INPUT_RING         = { boxShadow: '0 0 0 1px color-mix(in srgb, var(--color-amethyst-400) 30%, transparent)' }
const INPUT_RING_ERROR   = { boxShadow: '0 0 0 1px var(--color-error)' }
const FOCUS_RING         = { boxShadow: '0 0 0 2px var(--color-amethyst-700)' }
const FOCUS_RING_ERROR   = { boxShadow: '0 0 0 2px var(--color-error)' }
const INPUT_TRANSITION   = { duration: 0.2, ease: 'easeOut' }

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { type: 'spring', stiffness: 260, damping: 24, delay },
})

export default function ContactSection() {
  const [form, setForm]     = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle')
  const [errors, setErrors] = useState({ name: false, email: false, message: false })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: false }))
  }

  const validate = () => {
    const e = {
      name:    !form.name.trim(),
      email:   !form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
      message: !form.message.trim(),
    }
    setErrors(e)
    return !Object.values(e).some(Boolean)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('sent')
      setForm({ name: '', email: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="w-full flex justify-center px-5 pt-10 pb-[140px] min-[730px]:px-10 min-[730px]:pt-8 min-[1088px]:px-14 min-[1088px]:pt-10 xl:px-20">
      <div className="w-full flex flex-col gap-8">

        {/* ── Full-width header ── */}
        <motion.div className="flex flex-col gap-2" {...fadeUp(0)}>
          <h2 className="text-[20px] xl:text-2xl font-bold text-text-primary tracking-[-0.01em]">Contact</h2>
          <p className="text-md text-text-secondary">
            Please fill out this form to get in touch, I'm excited to hear about your ideas.
          </p>
        </motion.div>

        {/* ── Form full width ── */}
        <motion.form
          className="flex flex-col gap-3"
          onSubmit={handleSubmit}
          noValidate
          {...fadeUp(0.1)}
        >
            {/* Name + Email row */}
            <div className="flex flex-col gap-3 md:flex-row">
              {/* Name */}
              <div className="flex flex-col gap-2 flex-1">
                <label htmlFor="name" className="text-[14px] font-medium text-text-primary">
                  Full name
                </label>
                <motion.input
                  id="name" name="name" type="text"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={handleChange}
                  required autoComplete="name"
                  className="w-full rounded-[10px] px-4 py-3 outline-none border-0 text-text-primary font-sans text-base bg-[color-mix(in_srgb,var(--color-surface)_60%,#0d1114)]"
                  animate={INPUT_RING}
                  whileFocus={FOCUS_RING}
                  transition={INPUT_TRANSITION}
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2 flex-1">
                <label htmlFor="email" className={`text-[14px] font-medium ${errors.email ? 'text-error' : 'text-text-primary'}`}>
                  Email
                </label>
                <motion.input
                  id="email" name="email" type="email"
                  placeholder="Email@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required autoComplete="email"
                  className="w-full rounded-[10px] px-4 py-3 outline-none border-0 text-text-primary font-sans text-base bg-[color-mix(in_srgb,var(--color-surface)_60%,#0d1114)]"
                  animate={errors.email ? INPUT_RING_ERROR : INPUT_RING}
                  whileFocus={errors.email ? FOCUS_RING_ERROR : FOCUS_RING}
                  transition={INPUT_TRANSITION}
                />
                {errors.email && (
                  <p className="text-[12px] text-error">Please enter a valid email.</p>
                )}
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="message"
                className="text-[14px] font-medium text-text-primary"
              >
                How can I help you?
              </label>
              <motion.textarea
                id="message" name="message"
                placeholder="Please write a small description of your project or idea"
                value={form.message}
                onChange={handleChange}
                required rows={6}
                className="w-full rounded-[10px] px-4 py-3 outline-none resize-y border-0 text-text-primary font-sans text-base bg-[color-mix(in_srgb,var(--color-surface)_60%,#0d1114)]"
                animate={errors.message ? INPUT_RING_ERROR : INPUT_RING}
                whileFocus={errors.message ? FOCUS_RING_ERROR : FOCUS_RING}
                transition={INPUT_TRANSITION}
              />
              {errors.message && (
                <p className="text-[12px] text-error">Please tell me how I can help.</p>
              )}
            </div>

            <div className="mt-1">
              <ContactFormButton
                type="submit"
                className="w-full"
                disabled={status === 'sending' || status === 'sent'}
              >
                {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Sent ✓' : 'Submit'}
              </ContactFormButton>
            </div>

            <div aria-live="polite" aria-atomic="true">
              {status === 'error' && (
                <div className="flex items-center gap-3">
                  <p className="text-[13px] text-error">
                    Something went wrong — please try again.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="text-[13px] underline text-error"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
        </motion.form>

        {/* ── Info card ── */}
        <motion.div
          className="relative flex flex-row items-center justify-between rounded-[20px] p-4 md:py-5 md:px-10 mt-2 overflow-hidden bg-white/[0.04] backdrop-blur-[32px] backdrop-saturate-[180%] border border-white/[0.08]"
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.2), 0 8px 32px rgba(0,0,0,0.3)' }}
          {...fadeUp(0.15)}
        >
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <Aurora
              colorStops={['#2e2937', '#8479a0', '#b2adc7']}
              amplitude={1.2}
              blend={0.6}
              speed={0.5}
            />
          </div>

          <div className="relative flex flex-col gap-1">
            <p className="heading-1">Ily Ameur</p>
            <p className="text-md text-brand">Design Engineer</p>
          </div>
          <div className="relative flex flex-row items-center gap-3">
            <LinkedInButton />
            <BookingButton static compact />
          </div>
        </motion.div>

        {/* ── Copyright ── */}
        <motion.p
          className="text-center text-md pt-10 text-brand"
          {...fadeUp(0.2)}
        >
          © 2026 Ily Ameur. All rights reserved.
        </motion.p>

      </div>
    </section>
  )
}
