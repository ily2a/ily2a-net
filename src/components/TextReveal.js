'use client'

import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'

const TextReveal = memo(function TextReveal({ text, className, scale = 1, initialDelay = 0 }) {
  const words = useMemo(() => text.split(' '), [text])

  return (
    <p className={className}>
      {words.map((word, wi) => (
        <motion.span
          key={wi}
          className="inline-block mr-[0.25em]"
          style={{ willChange: 'filter, transform, opacity' }}
          initial={{ opacity: 0, filter: 'blur(6px)', y: 8, scale }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: scale === 1 ? 40 : 30,
            mass: 1,
            delay: initialDelay + wi * 0.06,
          }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  )
})

export default TextReveal
