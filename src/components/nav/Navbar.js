'use client'

import { memo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import NavbarButton from '@/components/buttons/NavbarButton'
import ContactButton from '@/components/buttons/ContactButton'
import MobileContactButton from '@/components/buttons/MobileContactButton'
import GlassSurface from '@/components/GlassSurface'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useActiveSection } from '@/hooks/useActiveSection'
import { scrollToElement } from '@/lib/scroll'

// Hoisted to module level — avoids recreating style objects on every render.
const GLASS_STYLE_MOBILE  = { maxWidth: '440px', minWidth: 'auto',  flexShrink: 0, boxSizing: 'border-box' }
const GLASS_STYLE_DESKTOP = { maxWidth: 'none',  minWidth: '472px', flexShrink: 0, boxSizing: 'border-box' }

const VALID_SECTIONS = new Set(['hero', 'work', 'capabilities', 'contact'])

const Navbar = memo(function Navbar({ isMobile = false }) {
  const pathname = usePathname()
  const router   = useRouter()
  const isHome   = pathname === '/'
  const isCraft  = pathname === '/craft' || pathname.startsWith('/craft/')
  const prefersReduced  = usePrefersReducedMotion()
  const activeSection   = useActiveSection()

  function navTo(sectionId) {
    if (!VALID_SECTIONS.has(sectionId)) return
    if (isHome) {
      scrollToElement(document.getElementById(sectionId), prefersReduced)
    } else if (isCraft && sectionId === 'contact') {
      scrollToElement(document.getElementById('contact'), prefersReduced)
    } else {
      router.push(`/?scrollTo=${sectionId}`)
    }
  }

  return (
    <GlassSurface
      width={isMobile ? 'calc(100vw - 32px)' : '472px'}
      height={64}
      borderRadius={12}
      style={isMobile ? GLASS_STYLE_MOBILE : GLASS_STYLE_DESKTOP}
    >
      <nav
        aria-label="Main navigation"
        className="inline-flex items-center justify-center gap-4 w-full h-full py-2 px-6 box-border"
      >
        <Logo isMobile={isMobile} onClick={() => navTo('hero')} />
        <NavbarButton icon="craft"  label="Craft"  onClick={() => navTo('work')}         aria-current={activeSection === 'work'         ? 'true' : undefined} />
        <NavbarButton icon="skills" label="Skills" onClick={() => navTo('capabilities')} aria-current={activeSection === 'capabilities' ? 'true' : undefined} />
        {isMobile ? (
          <div className="flex-1 min-w-0">
            <MobileContactButton onClick={() => navTo('contact')} aria-current={activeSection === 'contact' ? 'true' : undefined} />
          </div>
        ) : (
          <ContactButton onClick={() => navTo('contact')} aria-current={activeSection === 'contact' ? 'true' : undefined} />
        )}
      </nav>
    </GlassSurface>
  )
})

export default Navbar
