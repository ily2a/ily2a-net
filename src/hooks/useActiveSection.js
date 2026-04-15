'use client'

import { useEffect, useState } from 'react'

const IDS = ['work', 'capabilities', 'contact']

// Returns the id of the nav section currently occupying the central viewport band.
// Activates when a section crosses into the top 60% of the viewport.
// Gracefully no-ops when sections are absent (e.g. craft pages missing #work).
export function useActiveSection() {
  const [active, setActive] = useState(null)

  useEffect(() => {
    const elements = IDS.map(id => document.getElementById(id)).filter(Boolean)
    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) { setActive(entry.target.id); break }
        }
      },
      { rootMargin: '-10% 0px -40% 0px', threshold: 0 }
    )

    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return active
}
