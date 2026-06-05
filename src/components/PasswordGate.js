'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SPRING_SNAP } from '@/constants/animations'
import NotFoundPasswordBg from '@/components/backgrounds/NotFoundPasswordBg'
import FloatingNav from '@/components/nav/FloatingNav'
import SilentErrorBoundary from '@/components/errors/SilentErrorBoundary'
import { FloatingLabelInput } from '@/components/form/FloatingLabelInput'

const SESSION_KEY = 'cs_unlocked'

export default function PasswordGate() {
  // Read sessionStorage synchronously via lazy initializer — runs once on
  // mount (client only), so no hydration mismatch and no visible flash.
  const [unlocked, setUnlocked] = useState(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem(SESSION_KEY) === '1'
  })
  const [password,  setPassword]  = useState('')
  const [status,    setStatus]    = useState('idle') // idle | checking | error | success
  const [showPass,  setShowPass]  = useState(false)

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
      if (res.status === 429) {
        setStatus('ratelimited')
        return
      }
      const data = await res.json()
      if (data.success) {
        sessionStorage.setItem(SESSION_KEY, '1')
        setStatus('success')
        setTimeout(() => setUnlocked(true), 800)
      } else {
        setStatus('error')
        setPassword('')
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
          <NotFoundPasswordBg />
          <SilentErrorBoundary><FloatingNav /></SilentErrorBoundary>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.05 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-[calc(100vw-32px)] max-w-[440px] text-center"
          >
            {/* Lock icon */}
            <motion.div
              animate={
                status === 'error'
                  ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
                  : { x: 0 }
              }
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.svg
                    key="check"
                    width="32" height="32" viewBox="0 0 24 24" fill="none"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    aria-hidden="true"
                  >
                    <motion.path
                      d="M5 13l4 4L19 7"
                      stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key={status === 'error' ? 'lock-error' : 'lock'}
                    width="32" height="32" viewBox="0 0 24 24"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    aria-hidden="true"
                  >
                    <motion.rect
                      x="3" y="11" width="18" height="11" rx="3"
                      animate={{ fill: status === 'error' ? 'var(--color-error)' : 'var(--color-text-secondary)' }}
                      transition={{ duration: 0.2 }}
                    />
                    <motion.path
                      d="M7 11V7a5 5 0 0 1 10 0v4"
                      fill="none" strokeWidth="2.5" strokeLinecap="round"
                      animate={{ stroke: status === 'error' ? 'var(--color-error)' : 'var(--color-text-secondary)' }}
                      transition={{ duration: 0.2 }}
                    />
                    <circle cx="12" cy="16.5" r="1.5" fill="var(--color-background)" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Heading */}
            <h1 id="password-gate-heading" className="text-intro text-text-primary mt-3 [text-indent:0.03em]">
              This one&apos;s locked.
            </h1>

            {/* Form */}
            <form onSubmit={handleSubmit} aria-labelledby="password-gate-heading" className="flex flex-col gap-4 w-full mt-3" noValidate>
              <div className="flex flex-col gap-2 text-left">
                <FloatingLabelInput
                  id="cs-password"
                  label="Got the password?"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setStatus('idle') }}
                  autoComplete="off"
                  hasError={status === 'error'}
                  errorId="cs-password-error"
                  rightSlot={
                    <motion.button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                      aria-pressed={showPass}
                      className="text-text-secondary"
                      whileHover={{ color: 'var(--color-text-primary)' }}
                      transition={SPRING_SNAP}
                    >
                      {showPass ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      )}
                    </motion.button>
                  }
                />
                <div role="alert" aria-atomic="true">
                  {status === 'error' && (
                    <p id="cs-password-error" className="text-[12px] text-error">
                      Incorrect password. Try again.
                    </p>
                  )}
                  {status === 'ratelimited' && (
                    <p id="cs-password-error" className="text-[12px] text-error">
                      Too many attempts — please wait before trying again.
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'checking' || status === 'ratelimited'}
                aria-busy={status === 'checking'}
                className="gradient-button w-full rounded-[8px] px-9 py-3 btn-label disabled:opacity-50 disabled:pointer-events-none"
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
