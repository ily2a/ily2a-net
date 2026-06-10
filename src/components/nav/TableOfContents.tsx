'use client'

import { useEffect, useState, useCallback, type MouseEvent } from 'react'
import { m } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { SPRING_SNAP } from '@/constants/animations'
import { scrollToElement } from '@/lib/scroll'

export interface TocItem {
  id: string
  label: string
  level: number
}

export default function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (!items.length) return

    let rafId: number | null = null
    function onScroll() {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        const threshold = window.innerHeight * 0.25
        let best: string | null = null
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

  const handleClick = useCallback((e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    // rAF lets pending layout work (lazy images, ResizeObserver) settle
    // before the target position is measured.
    requestAnimationFrame(() => {
      scrollToElement(document.getElementById(id), prefersReduced)
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
            <m.a
              href={`#${id}`}
              onClick={(e) => handleClick(e, id)}
              aria-current={activeId === id ? 'location' : undefined}
              className={`block text-toc py-[5px] border-l ${level === 3 ? 'pl-6' : 'pl-3'}`}
              animate={{
                color: activeId === id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                borderColor: activeId === id ? 'var(--color-brand)' : 'var(--color-glass-border)',
              }}
              whileHover={activeId !== id ? {
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border-hover)',
              } : undefined}
              transition={SPRING_SNAP}
            >
              {label}
            </m.a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
