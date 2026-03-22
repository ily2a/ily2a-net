'use client'

const CARDS = [
  {
    title: 'Product Design',
    icon: '/capabilities icons/cube.png',
    description: 'From discovery to handoff. Complex flows, scalable systems, products that ship.',
    gradient: 'linear-gradient(90deg, #b2adc7, #6c6284, transparent)',
    tags: ['Mobile & Web', 'SaaS', 'Design Systems', 'End-to-end Design'],
  },
  {
    title: 'Design Engineering',
    icon: '/capabilities icons/drop.png',
    description: 'I close the gap between design and code. React components, zero handoff friction.',
    gradient: 'linear-gradient(90deg, #8479a0, #484257, transparent)',
    tags: ['React', 'React Native', 'Component Architecture', 'Figma-to-code'],
  },
]

const SKILL_GROUPS = [
  {
    label: 'Design',
    items: ['Systems Thinking', 'Complex Flows', 'Design Systems', 'Interaction Design', 'End-to-end Ownership'],
  },
  {
    label: 'Code',
    items: ['React', 'React Native', 'Component Architecture', 'Figma-to-code'],
  },
]

import { useRef, useState } from 'react'
import Image from 'next/image'

function SpotlightCard({ children, className = '', style, spotlightColor = 'rgba(178, 173, 199, 0.13)' }) {
  const divRef = useRef(null)
  const [isFocused, setIsFocused] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e) => {
    if (!divRef.current || isFocused) return
    const rect = divRef.current.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleFocus    = () => { setIsFocused(true);  setOpacity(1) }
  const handleBlur     = () => { setIsFocused(false); setOpacity(0) }
  const handleMouseEnter = () => setOpacity(1)
  const handleMouseLeave = () => setOpacity(0)

  const handleTouchStart = (e) => {
    if (!divRef.current) return
    const rect  = divRef.current.getBoundingClientRect()
    const touch = e.touches[0]
    setPosition({ x: touch.clientX - rect.left, y: touch.clientY - rect.top })
    setOpacity(1)
  }
  const handleTouchEnd = () => setOpacity(0)

  return (
    <div
      ref={divRef}
      className={`cap-card ${className}`}
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
    <ul className="cap-tags">
      {items.map((item) => (
        <li key={item} className="cap-tag">{item}</li>
      ))}
    </ul>
  )
}

export default function CapabilitiesSection() {
  return (
    <section id="capabilities" className="cap-section">
      <div className="cap-inner">

        {/* ── Header ── */}
        <div className="cap-header">
          <h2 className="cap-title">Capabilities</h2>
          <p className="text-md cap-subtitle">
            End-to-end product design with the technical range to build what I design.
          </p>
        </div>

        {/* ── Service cards ── */}
        <div className="cap-cards-grid">
          {CARDS.map((card) => (
            <SpotlightCard key={card.title}>
              <div className="cap-card__header">
                <div className="cap-card__title-row">
                  <Image src={card.icon} alt="" aria-hidden="true" width={40} height={40} className="cap-card__icon" unoptimized />
                  <h3 className="cap-card__title">{card.title}</h3>
                </div>
                <hr className="cap-card__divider" style={{ background: card.gradient }} aria-hidden="true" />
              </div>
              <p className="cap-card__description">{card.description}</p>
              <Tags items={card.tags} />
            </SpotlightCard>
          ))}
        </div>

        {/* ── Skills + Tools ── */}
        <div className="cap-bottom-grid">

          <SpotlightCard>
            <div className="cap-card__header">
              <div className="cap-card__title-row">
                <Image src="/capabilities icons/arrow.png" alt="" aria-hidden="true" width={40} height={40} className="cap-card__icon" unoptimized />
                <h3 className="cap-card__title">Skills</h3>
              </div>
              <hr className="cap-card__divider" aria-hidden="true" style={{ background: 'linear-gradient(90deg, #b2adc7, #6c6284, transparent)' }} />
            </div>
            <div className="cap-skills-groups">
              {SKILL_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="cap-skill-label">{group.label}</p>
                  <Tags items={group.items} />
                </div>
              ))}
            </div>
          </SpotlightCard>

          <SpotlightCard>
            <div className="cap-card__header">
              <div className="cap-card__title-row">
                <Image src="/capabilities icons/brain.png" alt="" aria-hidden="true" width={40} height={40} className="cap-card__icon" unoptimized />
                <h3 className="cap-card__title">Tools</h3>
              </div>
              <hr className="cap-card__divider" aria-hidden="true" style={{ background: 'linear-gradient(90deg, #9c95b6, #484257, transparent)' }} />
            </div>
            <p className="cap-card__description">The stack I work in daily</p>
            <ul className="cap-tags">
              {TOOLS.map((tool) => (
                <li key={tool.name} className="cap-tag cap-tool-tag">
                  <Image src={tool.logo} alt="" aria-hidden="true" width={24} height={24} className="cap-tool-logo" />
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
