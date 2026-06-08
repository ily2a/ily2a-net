'use client'

import { m } from 'framer-motion'
import { SPRING_SNAP } from '@/constants/animations'

// External-link icon — visible cue alongside the SR-only "(opens in new tab)"
// announcement, so sighted and AT users both get the warning.
function ExternalIcon() {
  return (
    <svg
      aria-hidden="true"
      width="0.75em"
      height="0.75em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block ml-0.5 align-[-0.05em]"
    >
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  )
}

export default function PortableTextLink({ href, children }) {
  return (
    <m.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand underline underline-offset-4"
      whileHover={{ opacity: 0.75 }}
      transition={SPRING_SNAP}
    >
      {children}
      <ExternalIcon />
      <span className="sr-only">, opens in new tab</span>
    </m.a>
  )
}
