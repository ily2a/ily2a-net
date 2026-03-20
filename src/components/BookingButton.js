'use client'

import { getCalApi } from '@calcom/embed-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CloseButton from '@/components/CloseButton'
import { useWindowWidth } from '@/hooks/useWindowWidth'
import { useButtonState } from '@/hooks/useButtonState'
import { SPRING_SNAP, SPRING_ENTRANCE, HERO_BUTTON_DELAY } from '@/constants/animations'

export default function BookingButton() {
  const [open, setOpen]             = useState(false)
  const [mounted, setMounted]       = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)

  const width    = useWindowWidth()
  const isMobile = width > 0 && width < 810
  const isTablet = width >= 810 && width < 1200

  const { state, handlers } = useButtonState()

  // Cal.com is initialised lazily — only when the user first opens the modal
  const calInitialized = useRef(false)
  const closeButtonRef = useRef(null)
  const frameRef       = useRef(null)  // modal content container for focus trap

  useEffect(() => { setMounted(true) }, [])

  // Reset iframe loading state each time modal opens
  useEffect(() => {
    if (open) setIframeLoaded(false)
  }, [open])

  // Focus management + focus trap + Escape handler when modal is open
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }

      // Focus trap — cycle within modal
      if (e.key === 'Tab' && frameRef.current) {
        const focusable = Array.from(
          frameRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), iframe'
          )
        )
        if (!focusable.length) return
        const first = focusable[0]
        const last  = focusable[focusable.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus() }
        } else {
          if (document.activeElement === last)  { e.preventDefault(); first.focus() }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // rAF instead of setTimeout — element is in DOM immediately after AnimatePresence mounts it
    const raf = requestAnimationFrame(() => closeButtonRef.current?.focus())

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      cancelAnimationFrame(raf)
    }
  }, [open])

  const initCal = async () => {
    if (calInitialized.current) return
    calInitialized.current = true
    try {
      const cal = await getCalApi()
      cal('ui', {
        theme: 'dark',
        cssVarsPerTheme: {
          dark: {
            'cal-brand':          'var(--color-brand)',
            'cal-brand-emphasis': 'var(--color-amethyst-300)',
            'cal-bg':             'var(--color-surface)',
            'cal-bg-subtle':      'var(--color-background)',
            'cal-border':         'var(--color-text-subtle)',
            'cal-text':           'var(--color-text-primary)',
            'cal-text-subtle':    'var(--color-text-secondary)',
          }
        },
        hideEventTypeDetails: false,
        layout: 'month_view',
      })
    } catch {
      // Cal.com failed to load — modal still renders the iframe directly
    }
  }

  const handleOpen = () => { initCal(); setOpen(true) }

  const innerStyles = {
    default: {
      background: 'linear-gradient(to bottom, var(--color-amethyst-50), var(--color-amethyst-500))',
      border:     '1px solid var(--color-amethyst-100)',
      boxShadow:  'none',
    },
    hover: {
      background: 'linear-gradient(to bottom, var(--color-text-primary), var(--color-amethyst-300))',
      border:     '1px solid var(--color-amethyst-300)',
      boxShadow:  'none',
    },
    pressed: {
      background: 'linear-gradient(to bottom, var(--color-text-primary), var(--color-amethyst-100))',
      border:     '1px solid var(--color-brand)',
      boxShadow:  'inset 0px 3px 3px var(--color-brand), inset 0px -3px 3px var(--color-brand), inset -3px 0px 3px var(--color-brand), inset 3px 0px 3px var(--color-brand)',
    },
  }

  const isSmall = isMobile || isTablet

  const backdropStyle = {
    position:       'fixed',
    inset:          0,
    background:     'var(--color-surface-blur)',
    backdropFilter: 'blur(4px)',
    zIndex:         9999,
    ...(isSmall && {
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        isMobile ? '16px 20px' : '16px 40px',
    }),
  }

  const frameStyle = isSmall ? {
    position:       'relative',
    width:          '100%',
    maxWidth:       '860px',
    height:         'calc(100vh - 128px)',
    maxHeight:      '800px',
    background:     'transparent',
    border:         '1px solid var(--color-brand)',
    borderRadius:   '8px',
    overflow:       'hidden',
    backdropFilter: 'blur(8px)',
  } : {
    position:       'absolute',
    top:    '64px',
    bottom: '64px',
    left:   '160px',
    right:  '160px',
    background:     'transparent',
    border:         '1px solid var(--color-brand)',
    borderRadius:   '8px',
    overflow:       'hidden',
    backdropFilter: 'blur(8px)',
  }

  const overlay = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Book a call with Ily Ameur"
          onClick={() => setOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={SPRING_SNAP}
          style={backdropStyle}
        >
          <motion.div
            key="frame"
            ref={frameRef}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={SPRING_SNAP}
            style={frameStyle}
          >
            <div style={{
              position: 'absolute',
              top:      '16px',
              zIndex:   10,
              ...(isMobile ? { right: '16px' } : { left: '16px' }),
            }}>
              <CloseButton ref={closeButtonRef} onClick={() => setOpen(false)} />
            </div>

            {/* Spinner shown while iframe loads */}
            {!iframeLoaded && (
              <div style={{
                position:       'absolute',
                inset:          0,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                pointerEvents:  'none',
              }}>
                <div className="booking-spinner" />
              </div>
            )}

            <iframe
              src="https://cal.com/ily2a/intro?embed=true"
              title="Book a call with Ily Ameur"
              width="100%"
              height="100%"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              onLoad={() => setIframeLoaded(true)}
              style={{ marginBottom: '-60px', height: 'calc(100% + 80px)', border: 'none' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...SPRING_ENTRANCE, delay: HERO_BUTTON_DELAY }}
        onClick={handleOpen}
        {...handlers}
        aria-label="Book a call"
        style={{
          display:        'inline-flex',
          alignItems:     'center',
          justifyContent: 'center',
          padding:        '8px',
          width:          '140px',
          height:         '60px',
          borderRadius:   '8px',
          background:     'rgba(211, 209, 224, 0.25)',
          cursor:         'pointer',
          border:         'none',
        }}
      >
        <motion.div
          animate={innerStyles[state]}
          transition={SPRING_SNAP}
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            width:          '100%',
            height:         '100%',
            borderRadius:   '8px',
          }}
        >
          <span className="btn-label" style={{ color: 'var(--color-background)', whiteSpace: 'nowrap' }}>
            Book a call
          </span>
        </motion.div>
      </motion.button>

      {mounted && createPortal(overlay, document.body)}
    </>
  )
}
