'use client'

import { m } from 'framer-motion'
import Navbar from '@/components/nav/Navbar'
import { useWindowWidth } from '@/hooks/useWindowWidth'
import { useHeroIntroPlayed } from '@/hooks/useHeroIntroPlayed'
import { SPRING_NAV } from '@/constants/animations'
import { BREAKPOINTS } from '@/constants/layout'

export default function FloatingNav({ delay = 0 }: { delay?: number }) {
  const introPlayed = useHeroIntroPlayed()
  const width    = useWindowWidth()
  const isMobile = width > 0 && width <= BREAKPOINTS.MOBILE

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <m.div
        className="pointer-events-auto"
        initial={introPlayed ? false : { y: 150 }}
        animate={{ y: 0 }}
        transition={{ ...SPRING_NAV, delay: introPlayed ? 0 : delay }}
      >
        <Navbar isMobile={isMobile} />
      </m.div>
    </div>
  )
}
