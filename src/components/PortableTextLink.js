'use client'

import { motion } from 'framer-motion'
import { SPRING_SNAP } from '@/constants/animations'

export default function PortableTextLink({ href, children }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand underline underline-offset-4"
      whileHover={{ opacity: 0.75 }}
      transition={SPRING_SNAP}
    >
      {children}
    </motion.a>
  )
}
