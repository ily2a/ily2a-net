'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { scrollToElement } from '@/lib/scroll'

const VALID_SECTIONS = new Set(['hero', 'work', 'capabilities', 'testimonials', 'contact'])

export default function ScrollToSection() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  useEffect(() => {
    const section = searchParams.get('scrollTo')
    if (!section || !VALID_SECTIONS.has(section)) return

    // Defer one frame so lazy backgrounds/images can settle layout before the
    // target's position is measured (mirrors TableOfContents.handleClick).
    // Measuring synchronously on a fresh deep-link can land the scroll short.
    const raf = requestAnimationFrame(() => {
      // Read the motion preference synchronously rather than via
      // usePrefersReducedMotion: that hook initialises to false on first
      // render, so depending on it would give a reduced-motion user the
      // animated scroll on this first (and only) run.
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      scrollToElement(document.getElementById(section), prefersReduced)

      // Clean the query param from the URL without adding to history — this is
      // post-scroll URL hygiene, not a navigation redirect.
      // react-doctor-disable-next-line react-doctor/nextjs-no-client-side-redirect
      router.replace('/', { scroll: false })
    })

    return () => cancelAnimationFrame(raf)
  }, [searchParams, router])

  return null
}
