'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const VALID_SECTIONS = new Set(['hero', 'work', 'capabilities', 'testimonials', 'contact'])

export default function ScrollToSection() {
  const searchParams   = useSearchParams()
  const router         = useRouter()
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    const section = searchParams.get('scrollTo')
    if (!section || !VALID_SECTIONS.has(section)) return

    const el = document.getElementById(section)
    if (el) {
      el.scrollIntoView({ behavior: prefersReduced ? 'instant' : 'smooth' })
    }

    // Clean the query param from the URL without adding to history
    router.replace('/', { scroll: false })
  }, [searchParams, router])

  return null
}
