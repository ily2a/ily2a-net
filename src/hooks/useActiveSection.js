'use client'

import { useEffect, useState } from 'react'

// Returns the id of the section currently occupying the central viewport band.
// Activates when a section crosses into the top-half of the viewport.
// Gracefully no-ops when sections are absent (e.g. craft pages missing #work).
export function useActiveSection(ids) {
  const [active, setActive] = useState(null)

  useEffect(() => {
    const elements = ids
      .map(id => document.getElementById(id))
      .filter(Boolean)
    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      // Band: activates when a section enters the top 60% of the viewport.
      { rootMargin: '-10% 0px -40% 0px', threshold: 0 }
    )

    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  // ids is a module-level constant in Navbar — stable reference, no re-runs needed.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return active
}
