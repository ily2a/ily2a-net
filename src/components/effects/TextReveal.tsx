'use client'

import { Fragment, memo, useMemo } from 'react'
import { m } from 'motion/react'
import { textRevealSpring } from '@/constants/animations'
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
      {words.map((word, wi) => (
        // Words can repeat in a sentence, so the index is required for
        // uniqueness. Position is also stable here: the word array is derived
        // from immutable text and never reordered.
        // eslint-disable-next-line react/no-array-index-key
        <Fragment key={`${word}-${wi}`}>
          {/* A real space (not margin) between words, so Google, copy-paste
              and screen readers get a properly spaced sentence. */}
          {wi > 0 && ' '}
          <m.span
            className="inline-block"
            initial={skip ? false : { opacity: 0, filter: 'blur(6px)', y: 8, scale }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
            transition={textRevealSpring(scale !== 1, skip ? 0 : initialDelay + wi * 0.06)}
          >
            {word}
          </m.span>
        </Fragment>
      ))}
    </p>
  )
})

export default TextReveal
