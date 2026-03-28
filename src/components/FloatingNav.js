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
    <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <motion.div
        className="pointer-events-auto"
        initial={{ opacity: 0, y: 150 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_NAV, delay }}
      >
        <Navbar isMobile={isMobile} />
      </motion.div>
    </div>
  )
}
