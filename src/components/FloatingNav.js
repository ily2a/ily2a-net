'use client'

import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import { useWindowWidth } from '@/hooks/useWindowWidth'
import { SPRING_NAV } from '@/constants/animations'
import { BREAKPOINTS } from '@/constants/layout'

export default function FloatingNav({ delay = 0 }) {
  const width    = useWindowWidth()
  const isMobile = width > 0 && width <= BREAKPOINTS.MOBILE

  return (
    <motion.div
      initial={{ opacity: 0, y: 150, x: '-50%' }}
      animate={{ opacity: 1, y: 0,   x: '-50%' }}
      transition={{ ...SPRING_NAV, delay }}
      className="fixed bottom-8 left-1/2 z-50 will-change-transform"
    >
      <Navbar isMobile={isMobile} />
    </motion.div>
  )
}
