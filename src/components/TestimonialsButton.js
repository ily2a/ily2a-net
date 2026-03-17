'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function TestimonialsButton() {
  const [state, setState] = useState('default')

  const innerStyles = {
    default: {
      background: 'linear-gradient(to bottom, #1a1a1a, #0d0d0d)',
      border: '1px solid #2a2a2a',
      boxShadow: 'none',
      padding: '0 16px',
    },
    hover: {
      background: 'linear-gradient(to bottom, #222222, #111111)',
      border: '1px solid #3a3a3a',
      boxShadow: 'none',
      padding: '0 16px',
    },
    pressed: {
      background: 'linear-gradient(to bottom, #111111, #1a1a1a)',
      border: '1px solid #444444',
      boxShadow: 'inset 0px 3px 3px #000, inset 0px -3px 3px #000, inset -3px 0px 3px #000, inset 3px 0px 3px #000',
      padding: '0 16px',
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 120,
        damping: 30,
        mass: 1,
        delay: 6,
      }}
      onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })}
      onHoverStart={() => setState('hover')}
      onHoverEnd={() => setState('default')}
      onTapStart={() => setState('pressed')}
      onTap={() => setState('hover')}
      onTapCancel={() => setState('default')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
        width: 'auto',
        height: '60px',
        borderRadius: '8px',
        background: 'rgba(13, 13, 13, 0.25)',
        cursor: 'pointer',
      }}
    >
      <motion.div
        animate={innerStyles[state]}
        transition={{ type: 'spring', stiffness: 2000, damping: 110, mass: 1 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          borderRadius: '8px',
        }}
      >
        <span className="btn-label" style={{ color: '#F3F5F6', whiteSpace: 'nowrap' }}>
          Echoes about me
        </span>
      </motion.div>
    </motion.div>
  )
}