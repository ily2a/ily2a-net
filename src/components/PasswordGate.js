'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LineWavesBackground from '@/components/LineWavesBackground'
import FloatingNav from '@/components/FloatingNav'
import SilentErrorBoundary from '@/components/SilentErrorBoundary'

const SESSION_KEY = 'cs_unlocked'

const INPUT_RING       = { boxShadow: '0 0 0 1px color-mix(in srgb, var(--color-amethyst-400) 30%, transparent)' }
const INPUT_RING_ERROR = { boxShadow: '0 0 0 1px var(--color-error)' }
const FOCUS_RING       = { boxShadow: '0 0 0 2px var(--color-amethyst-700)' }
const FOCUS_RING_ERROR = { boxShadow: '0 0 0 2px var(--color-error)' }
const INPUT_TRANSITION = { duration: 0.2, ease: 'easeOut' }

export default function PasswordGate() {
  const [unlocked, setUnlocked] = useState(false)
  const [password, setPassword] = useState('')
  const [status,   setStatus]   = useState('idle') // idle | checking | error
  const inputRef = useRef(null)

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === '1') setUnlocked(true)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password.trim()) return
    setStatus('checking')
    try {
      const res  = await fetch('/api/unlock', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ password }),
      })
      const data = await res.json()
      if (data.success) {
        sessionStorage.setItem(SESSION_KEY, '1')
        setUnlocked(true)
      } else {
        setStatus('error')
        setPassword('')
        inputRef.current?.focus()
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <AnimatePresence>
      {!unlocked && (
        <motion.div
          key="gate"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeOut' } }}
          className="fixed inset-0 z-[200] overflow-hidden bg-background"
        >
          <LineWavesBackground />
          <SilentErrorBoundary><FloatingNav /></SilentErrorBoundary>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.05 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 px-5 w-full max-w-[440px] text-center"
          >
            {/* Heading */}
            <h1 className="text-intro text-text-primary">
              This one&apos;s locked.
            </h1>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full" noValidate>
              <div className="flex flex-col gap-2 text-left">
                <label htmlFor="cs-password" className="text-label text-text-primary">
                  Got the password?
                </label>
                <motion.input
                  ref={inputRef}
                  id="cs-password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setStatus('idle') }}
                  placeholder="Enter password"
                  autoFocus
                  autoComplete="current-password"
                  className="w-full rounded-[10px] px-4 py-3 outline-none border-0 text-text-primary font-sans text-base bg-[color-mix(in_srgb,var(--color-surface)_60%,#0d1114)]"
                  animate={status === 'error' ? INPUT_RING_ERROR : INPUT_RING}
                  whileFocus={status === 'error' ? FOCUS_RING_ERROR : FOCUS_RING}
                  transition={INPUT_TRANSITION}
                  aria-invalid={status === 'error' || undefined}
                  aria-describedby={status === 'error' ? 'cs-password-error' : undefined}
                />
                {status === 'error' && (
                  <p id="cs-password-error" className="text-[12px] text-error">
                    Incorrect password. Try again.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={status === 'checking'}
                className="gradient-button w-full rounded-[8px] px-9 py-4 btn-label disabled:opacity-50 disabled:pointer-events-none"
              >
                {status === 'checking' ? 'Checking…' : 'Unlock case study'}
              </button>
            </form>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
