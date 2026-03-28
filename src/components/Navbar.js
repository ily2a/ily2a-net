'use client'

import { memo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import NavbarButton from '@/components/NavbarButton'
import ContactButton from '@/components/ContactButton'
import MobileContactButton from '@/components/MobileContactButton'
import GlassSurface from '@/components/GlassSurface'

// Hoisted to module level so GlassSurface's useMemo sees a stable reference.
const GLASS_STYLE_MOBILE  = { maxWidth: '440px', minWidth: 'auto',  flexShrink: 0, boxSizing: 'border-box' }
const GLASS_STYLE_DESKTOP = { maxWidth: 'none',  minWidth: '472px', flexShrink: 0, boxSizing: 'border-box' }

const VALID_SECTIONS = new Set(['hero', 'work', 'capabilities', 'contact'])

const Navbar = memo(function Navbar({ isMobile = false }) {
  const pathname = usePathname()
  const router   = useRouter()
  const isHome   = pathname === '/'

  function navTo(sectionId) {
    if (!VALID_SECTIONS.has(sectionId)) return
    if (isHome) {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      router.push(`/?scrollTo=${sectionId}`)
    }
  }

  return (
    <GlassSurface
      width={isMobile ? 'calc(100vw - 32px)' : '472px'}
      height={64}
      borderRadius={12}
      distortionScale={-150}
      blur={30}
      brightness={22}
      opacity={0.8}
      displace={6}
      backgroundOpacity={0.18}
      fallbackBlur={50}
      fallbackSaturation={450}
      style={isMobile ? GLASS_STYLE_MOBILE : GLASS_STYLE_DESKTOP}
    >
      <nav
        aria-label="Main navigation"
        className="inline-flex items-center justify-center gap-4 w-full h-full py-2 px-6 box-border"
      >
        <Logo isMobile={isMobile} onClick={() => navTo('hero')} />
        <NavbarButton icon="craft"  label="Craft"  onClick={() => navTo('work')} />
        <NavbarButton icon="skills" label="Skills" onClick={() => navTo('capabilities')} />
        {isMobile ? (
          <div className="flex-1 min-w-0">
            <MobileContactButton onClick={() => navTo('contact')} />
          </div>
        ) : (
          <ContactButton onClick={() => navTo('contact')} />
        )}
      </nav>
    </GlassSurface>
  )
})

export default Navbar
