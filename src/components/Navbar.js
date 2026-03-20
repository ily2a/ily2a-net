'use client'

import Logo from '@/components/Logo'
import NavbarButton from '@/components/NavbarButton'
import ContactButton from '@/components/ContactButton'
import MobileContactButton from '@/components/MobileContactButton'
import GlassSurface from '@/components/GlassSurface'

export default function Navbar({ isMobile = false }) {
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
      style={{
        maxWidth: isMobile ? '440px' : 'none',
        minWidth: isMobile ? 'auto' : '472px',
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
    >
      <nav
        aria-label="Main navigation"
        style={{
          display:        'inline-flex',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '16px',
          width:          '100%',
          height:         '100%',
          padding:        '8px 24px',
          boxSizing:      'border-box',
        }}
      >
        <Logo isMobile={isMobile} />
        <NavbarButton icon="craft"  label="Craft"  isMobile={isMobile} />
        <NavbarButton icon="skills" label="Skills" isMobile={isMobile} />
        {isMobile ? (
          <div style={{ flex: 1, minWidth: 0 }}>
            <MobileContactButton />
          </div>
        ) : (
          <ContactButton />
        )}
      </nav>
    </GlassSurface>
  )
}
