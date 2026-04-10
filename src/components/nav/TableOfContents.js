'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export default function TableOfContents({ items }) {
  const [activeId, setActiveId] = useState(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (!items.length) return

    let rafId = null
    function onScroll() {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        const threshold = window.innerHeight * 0.25
        let best = null
        for (const { id } of items) {
          const el = document.getElementById(id)
          if (!el) continue
          const top = el.getBoundingClientRect().top
          if (top <= threshold) best = id
        }
        setActiveId(best)
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [items])

  const handleClick = useCallback((e, id) => {
    e.preventDefault()
    // Use scrollIntoView via rAF so any pending layout work (lazy images,
    // ResizeObserver) settles before the target position is calculated.
    requestAnimationFrame(() => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: prefersReduced ? 'instant' : 'smooth' })
    })
  }, [prefersReduced])

  if (!items.length) return null

  return (
    <nav aria-label="On this page">
      <p className="text-eyebrow text-text-secondary mb-3">
        On this page
      </p>
      <ul className="flex flex-col">
        {items.map(({ id, label, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={(e) => handleClick(e, id)}
              aria-current={activeId === id ? 'location' : undefined}
              className={`block text-toc py-[5px] border-l transition-colors duration-150 ${
                level === 3 ? 'pl-6' : 'pl-3'
              } ${
                activeId === id
                  ? 'text-text-primary border-brand'
                  : 'text-text-secondary border-glass-border hover:text-text-primary hover:border-white/25'
              }`}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
