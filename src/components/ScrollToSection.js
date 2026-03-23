'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

const VALID_SECTIONS = new Set(['hero', 'work', 'capabilities', 'testimonials', 'contact'])

export default function ScrollToSection() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  useEffect(() => {
    const section = searchParams.get('scrollTo')
    if (!section || !VALID_SECTIONS.has(section)) return

    const el = document.getElementById(section)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }

    // Clean the query param from the URL without adding to history
    router.replace('/', { scroll: false })
  }, [searchParams, router])

  return null
}
