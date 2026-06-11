'use client'

import { memo, useMemo } from 'react'
import { m } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface TextRevealProps {
  text: string
  className?: string
  scale?: number
  initialDelay?: number
  instant?: boolean
}

const TextReveal = memo(function TextReveal({ text, className, scale = 1, initialDelay = 0, instant = false }: TextRevealProps) {
  const words          = useMemo(() => text.split(' '), [text])
  const prefersReduced = usePrefersReducedMotion()
  const skip           = instant || prefersReduced

  return (
    <p className={className}>
      {/* The animated words are adjacent inline-block spans with no whitespace
          between them (spacing comes from margin), so assistive tech and text
          extraction would read the sentence as one concatenated string. Expose
          the real text via an sr-only span and hide the visual copies. */}
      <span className="sr-only">{text}</span>
      {words.map((word, wi) => (
        <m.span
          // Words can repeat in a sentence, so the index is required for
          // uniqueness. Position is also stable here — the word array is
          // derived from immutable text and never reordered.
          // eslint-disable-next-line react/no-array-index-key
          key={`${word}-${wi}`}
          aria-hidden="true"
          className="inline-block mr-[0.25em]"
          initial={skip ? false : { opacity: 0, filter: 'blur(6px)', y: 8, scale }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: scale === 1 ? 40 : 30,
            mass: 1,
            delay: skip ? 0 : initialDelay + wi * 0.06,
          }}
        >
          {word}
        </m.span>
      ))}
    </p>
  )
})

export default TextReveal
