'use client'

const CARDS = [
  {
    title: 'Product Design',
    icon: '/capabilities icons/cube.png',
    description: 'From discovery to handoff. Complex flows, scalable systems, products that ship.',
    gradient: 'linear-gradient(90deg, var(--color-amethyst-400), var(--color-amethyst-700), transparent)',
    tags: ['Mobile & Web', 'SaaS', 'Design Systems', 'End-to-end Design'],
  },
  {
    title: 'Design Engineering',
    icon: '/capabilities icons/drop.png',
    description: 'I close the gap between design and code. React components, zero handoff friction.',
    gradient: 'linear-gradient(90deg, var(--color-amethyst-600), var(--color-amethyst-900), transparent)',
    tags: ['React', 'React Native', 'Component Architecture', 'Figma-to-code'],
  },
]

const SKILL_GROUPS = [
  {
    label: 'Design',
    items: ['Systems Thinking', 'Complex Flows', 'Design Systems', 'Interaction Design', 'End-to-end Design'],
  },
  {
    label: 'Code',
    items: ['React', 'React Native', 'Component Architecture', 'Figma-to-code'],
  },
]

import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'

function SpotlightCard({ children, className = '', style, spotlightColor = 'color-mix(in srgb, var(--color-amethyst-400) 13%, transparent)' }) {
  const divRef = useRef(null)
  const [isFocused, setIsFocused] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove   = useCallback((e) => {
    if (!divRef.current || isFocused) return
    const rect = divRef.current.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [isFocused])

  const handleFocus       = useCallback(() => { setIsFocused(true);  setOpacity(1) }, [])
  const handleBlur        = useCallback(() => { setIsFocused(false); setOpacity(0) }, [])
  const handleMouseEnter  = useCallback(() => setOpacity(1), [])
  const handleMouseLeave  = useCallback(() => setOpacity(0), [])

  const handleTouchStart  = useCallback((e) => {
    if (!divRef.current) return
    const rect  = divRef.current.getBoundingClientRect()
    const touch = e.touches[0]
    setPosition({ x: touch.clientX - rect.left, y: touch.clientY - rect.top })
    setOpacity(1)
  }, [])
  const handleTouchEnd    = useCallback(() => setOpacity(0), [])

  return (
    <div
      ref={divRef}
      className={`cap-card rounded-xl ${className}`}
      style={style}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="cap-card__spotlight"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      {children}
    </div>
  )
}

const TOOLS = [
  { name: 'Figma',  logo: '/logos/figma.svg'  },
  { name: 'Cursor', logo: '/logos/cursor.svg' },
  { name: 'Spline', logo: '/logos/spline.svg' },
  { name: 'Rive',   logo: '/logos/rive.svg'   },
]

function Tags({ items }) {
  return (
    <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
      {items.map((item) => (
        <li key={item} className="inline-flex items-center px-3 py-[5px] border border-text-subtle rounded-[6px] text-[13px] font-medium text-text-primary tracking-[-0.01em] leading-[1.4]">
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function CapabilitiesSection() {
  return (
    <section id="capabilities" className="w-full flex justify-center px-4 py-7 tab:px-10 tab:py-8 desk:px-14 desk:py-10 xl:px-20">
      <div className="w-full max-w-[600px] flex flex-col gap-3 tab:max-w-none xl:max-w-[1440px]">

        {/* ── Header ── */}
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-[20px] xl:text-2xl text-text-primary tracking-[-0.01em]">Capabilities</h2>
          <p className="text-md text-text-secondary">
            End-to-end product design with the technical range to build what I design.
          </p>
        </div>

        {/* ── Service cards ── */}
        <div className="grid grid-cols-1 gap-3 min-[600px]:grid-cols-2">
          {CARDS.map((card) => (
            <SpotlightCard key={card.title}>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Image src={card.icon} alt="" aria-hidden="true" width={40} height={40} className="w-10 h-10 object-contain shrink-0" />
                  <h3 className="font-bold text-[18px] xl:text-[20px] text-text-primary tracking-[-0.01em]">{card.title}</h3>
                </div>
                <hr className="h-[6px] border-0 rounded-sm m-0" style={{ background: card.gradient }} aria-hidden="true" />
              </div>
              <p className="text-[14px] desk:text-[15px] xl:text-base text-brand leading-[160%] tracking-[0.02em]">{card.description}</p>
              <Tags items={card.tags} />
            </SpotlightCard>
          ))}
        </div>

        {/* ── Skills + Tools ── */}
        <div className="grid grid-cols-1 gap-3 min-[600px]:grid-cols-[2fr_1fr]">

          <SpotlightCard>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Image src="/capabilities icons/arrow.png" alt="" aria-hidden="true" width={40} height={40} className="w-10 h-10 object-contain shrink-0" />
                <h3 className="font-bold text-[18px] xl:text-[20px] text-text-primary tracking-[-0.01em]">Skills</h3>
              </div>
              <hr className="h-[6px] border-0 rounded-sm m-0 bg-gradient-to-r from-amethyst-400 via-amethyst-700 to-transparent" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-3">
              {SKILL_GROUPS.map((group) => (
                <div key={group.label} className="flex flex-row items-center flex-wrap gap-2">
                  <p className="inline-flex items-center px-3 py-[5px] text-[12px] font-semibold tracking-[0.08em] text-brand leading-[1.4] whitespace-nowrap">{group.label}</p>
                  <Tags items={group.items} />
                </div>
              ))}
            </div>
          </SpotlightCard>

          <SpotlightCard>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Image src="/capabilities icons/brain.png" alt="" aria-hidden="true" width={40} height={40} className="w-10 h-10 object-contain shrink-0" />
                <h3 className="font-bold text-[18px] xl:text-[20px] text-text-primary tracking-[-0.01em]">Tools</h3>
              </div>
              <hr className="h-[6px] border-0 rounded-sm m-0 bg-gradient-to-r from-amethyst-500 via-amethyst-900 to-transparent" aria-hidden="true" />
            </div>
            <p className="text-[14px] desk:text-[15px] xl:text-base text-brand leading-[160%] tracking-[0.02em]">The stack I work in daily</p>
            <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
              {TOOLS.map((tool) => (
                <li key={tool.name} className="inline-flex items-center gap-[6px] px-3 py-[5px] border border-text-subtle rounded-[6px] text-[13px] font-medium text-text-primary tracking-[-0.01em] leading-[1.4]">
                  <Image src={tool.logo} alt="" aria-hidden="true" width={24} height={24} className="w-6 h-6 object-contain shrink-0" />
                  {tool.name}
                </li>
              ))}
            </ul>
          </SpotlightCard>

        </div>
      </div>
    </section>
  )
}
