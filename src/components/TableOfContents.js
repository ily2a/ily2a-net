'use client'

import { useEffect, useState } from 'react'

export default function TableOfContents({ items }) {
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    if (!items.length) return

    function onScroll() {
      const threshold = window.innerHeight * 0.25
      let best = null
      for (const { id } of items) {
        const el = document.getElementById(id)
        if (!el) continue
        const top = el.getBoundingClientRect().top
        if (top <= threshold) best = id
      }
      setActiveId(best)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [items])

  if (!items.length) return null

  return (
    <nav aria-label="On this page">
      <p className="font-medium tracking-[0.07em] leading-[150%] text-[11px] uppercase text-text-secondary mb-3">
        On this page
      </p>
      <ul className="flex flex-col">
        {items.map(({ id, label, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={activeId === id ? 'true' : undefined}
              className={`block text-[13px] xl:text-[14px] font-medium leading-[1.4] tracking-[-0.01em] py-[5px] border-l transition-colors duration-150 ${
                level === 3 ? 'pl-6' : 'pl-3'
              } ${
                activeId === id
                  ? 'text-text-primary border-brand'
                  : 'text-text-secondary border-white/[0.08] hover:text-text-primary hover:border-white/25'
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
