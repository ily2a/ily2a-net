'use client'

import { memo } from 'react'
import Logo from '@/components/Logo'
import NavbarButton from '@/components/NavbarButton'
import ContactButton from '@/components/ContactButton'
import MobileContactButton from '@/components/MobileContactButton'
import GlassSurface from '@/components/GlassSurface'

// Hoisted to module level so GlassSurface's useMemo sees a stable reference.
const GLASS_STYLE_MOBILE  = { maxWidth: '440px', minWidth: 'auto',  flexShrink: 0, boxSizing: 'border-box' }
const GLASS_STYLE_DESKTOP = { maxWidth: 'none',  minWidth: '472px', flexShrink: 0, boxSizing: 'border-box' }

const Navbar = memo(function Navbar({ isMobile = false }) {
  return (
    <GlassSurface
      width={isMobile ? 'calc(100vw - 32px)' : '472px'}
      height={64}
      borderRadius={12}
      distortionScale={-40}
      blur={30}
      brightness={15}
      opacity={0.8}
      displace={4}
      backgroundOpacity={0.4}
      style={isMobile ? GLASS_STYLE_MOBILE : GLASS_STYLE_DESKTOP}
    >
      <nav
        aria-label="Main navigation"
        className="inline-flex items-center justify-center gap-4 w-full h-full py-2 px-6 box-border"
      >
        <Logo isMobile={isMobile} onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })} />
        {/* aria-disabled until /craft and /skills routes are implemented */}
        <NavbarButton icon="craft"  label="Craft"  isMobile={isMobile} onClick={() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })} />
        <NavbarButton icon="skills" label="Skills" isMobile={isMobile} onClick={() => document.getElementById('capabilities')?.scrollIntoView({ behavior: 'smooth' })} />
        {isMobile ? (
          <div className="flex-1 min-w-0">
            <MobileContactButton />
          </div>
        ) : (
          <ContactButton />
        )}
      </nav>
    </GlassSurface>
  )
})

export default Navbar
