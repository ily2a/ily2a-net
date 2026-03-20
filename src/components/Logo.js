'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Logo({ mobile = false, onClick }) {
  const [state, setState] = useState('default')

  const src = {
    default: '/assets/logo-default.svg',
    hover: '/assets/logo-hover.svg',
    pressed: '/assets/logo-pressed.svg',
  }

  return (
    <motion.div
      onClick={onClick}
      onHoverStart={() => !mobile && setState('hover')}
      onHoverEnd={() => setState('default')}
      onTapStart={() => setState('pressed')}
      onTap={() => setState(mobile ? 'default' : 'hover')}
      onTapCancel={() => setState('default')}
      style={{ cursor: 'pointer', display: 'inline-flex', flexShrink: 0 }}
    >
      <Image
        src={src[state]}
        alt="ily2a"
        width={64}
        height={32}
        unoptimized
        style={{ display: 'block' }}
      />
    </motion.div>
  )
}
