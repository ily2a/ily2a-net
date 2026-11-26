'use client'

import { useEffect, useState } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { useButtonState } from '@/hooks/useButtonState'
import { SPRING_SNAP } from '@/constants/animations'
import { ICON_LINK_BUTTON_STATES as states } from '@/components/buttons/LinkedInButton'

const COPIED_MS = 2000
const ICON_MOTION = {
  initial:    { opacity: 0, scale: 0.6 },
  animate:    { opacity: 1, scale: 1 },
  exit:       { opacity: 0, scale: 0.6 },
  transition: SPRING_SNAP,
}

// Lucide "copy" / "check" geometry, stroked in the current state's icon colour.
function CopyIcon() {
  return (
    <>
      <rect x="8" y="8" width="14" height="14" rx="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </>
  )
}

export default function CopyEmailButton({ email }: { email: string }) {
  const { state, handlers } = useButtonState()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), COPIED_MS)
    return () => clearTimeout(t)
  }, [copied])

  const handleCopy = () => {
    navigator.clipboard?.writeText(email).then(() => setCopied(true), () => {})
  }

  return (
    <>
      <m.button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Email copied' : 'Copy email address'}
        {...handlers}
        animate={{
          borderColor:     states[state].borderColor,
          backgroundColor: states[state].backgroundColor,
          boxShadow:       states[state].boxShadow,
        }}
        // Hover is instant (Craft hover restraint); only press keeps the snap spring.
        transition={state === 'pressed' ? SPRING_SNAP : { duration: 0 }}
        className="inline-flex items-center justify-center shrink-0 h-11 w-11 rounded-pill border border-transparent cursor-pointer"
      >
        <svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          fill="none"
          stroke={states[state].iconColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <m.path key="check" d="M20 6 9 17l-5-5" {...ICON_MOTION} />
            ) : (
              <m.g key="copy" {...ICON_MOTION} style={{ transformOrigin: 'center' }}>
                <CopyIcon />
              </m.g>
            )}
          </AnimatePresence>
        </svg>
      </m.button>
      <span className="sr-only" aria-live="polite">{copied ? 'Email address copied to clipboard' : ''}</span>
    </>
  )
}
