'use client'

import Logo from '@/components/Logo'
import NavbarButton from '@/components/NavbarButton'
import ContactButton from '@/components/ContactButton'
import MobileContactButton from '@/components/MobileContactButton'
import GlassSurface from '@/components/GlassSurface'

export default function Navbar({ mobile = false }) {
  return (
    <GlassSurface
      width={mobile ? 'calc(100vw - 32px)' : '472px'}
      height={64}
      borderRadius={12}
      distortionScale={-40}
      blur={30}
      brightness={15}
      opacity={0.8}
      displace={4}
      style={{
        maxWidth: mobile ? '440px' : 'none',
        minWidth: mobile ? 'auto' : '472px',
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
    >
      <nav style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        width: '100%',
        height: '100%',
        padding: '8px 24px',
        boxSizing: 'border-box',
      }}>
        <Logo mobile={mobile} />
        <NavbarButton icon="craft" label="Craft" mobile={mobile} />
        <NavbarButton icon="skills" label="Skills" mobile={mobile} />
        {mobile ? (
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