'use client'

import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'

const TextReveal = memo(function TextReveal({ text, className, scale = 1, initialDelay = 0 }) {
  const words = useMemo(() => text.split(' ').map(w => w.split('')), [text])

  return (
    <p className={className} style={{ display: 'flex', flexWrap: 'wrap' }}>
      {words.map((chars, wi) => (
        <span key={wi} style={{ display: 'inline-flex' }}>
          {chars.map((char, ci) => (
            <motion.span
              key={`${wi}-${ci}`}
              initial={{ opacity: 0, filter: 'blur(10px)', y: 10, scale }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: scale === 1 ? 40 : 30,
                mass: 1,
                delay: initialDelay + (wi * 5 + ci) * 0.05,
              }}
            >
              {char}
            </motion.span>
          ))}
          {wi < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </p>
  )
})

export default TextReveal
