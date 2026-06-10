'use client'

import { useEffect, useState } from 'react'

const IDS = ['work', 'capabilities', 'contact'] as const

// Returns the id of the nav section currently occupying the central viewport band.
// Activates when a section crosses into the top 60% of the viewport.
// Gracefully no-ops when sections are absent (e.g. craft pages missing #work).
export function useActiveSection(): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const elements = IDS
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (!elements.length) return

    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        setActive(IDS.find(id => visible.has(id)) ?? null)
      },
      { rootMargin: '-10% 0px -40% 0px', threshold: 0 }
    )

    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return active
}
