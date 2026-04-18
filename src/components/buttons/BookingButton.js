'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CloseButton from '@/components/buttons/CloseButton'
import { useWindowWidth } from '@/hooks/useWindowWidth'
import { SPRING_SNAP, SPRING_ENTRANCE, HERO_BUTTON_DELAY, HOVER_LIFT } from '@/constants/animations'

function releaseScrollLock() {
  const scrollY = parseInt(document.body.dataset.scrollY ?? '0', 10)
  document.body.style.position = ''
  document.body.style.top      = ''
  document.body.style.width    = ''
  delete document.body.dataset.scrollY
  window.scrollTo(0, scrollY)
}

// Shared frame visual properties — single source of truth for border, blur, etc.
const FRAME_BASE = {
  background:     'transparent',
  border:         '1px solid var(--color-brand)',
  borderRadius:   '8px',
  overflow:       'hidden',
  backdropFilter: 'blur(8px)',
}

export default function BookingButton({ static: isStatic = false }) {
  const [open, setOpen]               = useState(false)
  const [mounted, setMounted]         = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [iframeHeight, setIframeHeight] = useState(600)

  const width          = useWindowWidth()
  const isMobile       = width > 0 && width < 810
  const isTablet       = width >= 810 && width < 1200

  // Cal.com is initialised lazily — only when the user first opens the modal
  const calInitialized  = useRef(false)
  const closeButtonRef  = useRef(null)
  const frameRef        = useRef(null)    // modal content container for focus trap
  const triggerRef      = useRef(null)    // element that opened the modal — restored on close
  const focusableRef    = useRef([])      // cached focusable elements — queried once on open
  const isOpeningRef    = useRef(false)   // synchronous open guard — blocks double-click before state settles

  const initCal = async () => {
    if (calInitialized.current) return
    calInitialized.current = true
    try {
      const { getCalApi } = await import('@calcom/embed-react')
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
      // Cal.com failed to load — modal still renders the iframe directly.
      // Reset the flag so the next open can reattempt initialisation.
      calInitialized.current = false
    }
  }

  useEffect(() => { setMounted(true) }, [])

  // Reset iframe state each time modal opens
  useEffect(() => {
    if (open) { setIframeLoaded(false); setIframeHeight(600) }
  }, [open])

  // Prevent AT and keyboard from reaching background content while modal is open.
  // aria-modal alone has inconsistent support in NVDA+Chrome and older JAWS.
  useEffect(() => {
    const main = document.getElementById('main-content')
    if (!main) return
    main.inert = open
    return () => { main.inert = false }
  }, [open])

  // Build focus trap element list after iframe signals load — single source of truth.
  // Excludes iframes: Cal.com is sandboxed so Tab cannot cycle within it (dead Tab stops).
  useEffect(() => {
    if (!open || !iframeLoaded || !frameRef.current) return
    focusableRef.current = Array.from(
      frameRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    )
  }, [open, iframeLoaded])

  const handleClose = useCallback(() => {
    releaseScrollLock()
    setOpen(false)
    isOpeningRef.current = false
    triggerRef.current?.focus({ preventScroll: true })
    triggerRef.current = null
  }, [])

  // Focus management + focus trap + Escape handler when modal is open
  useEffect(() => {
    if (!open) { focusableRef.current = []; return }

    // rAF: element is in DOM immediately after AnimatePresence mounts it
    const raf = requestAnimationFrame(() => {
      closeButtonRef.current?.focus()
    })

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { handleClose(); return }

      // Focus trap — cycle within modal
      if (e.key === 'Tab' && focusableRef.current.length) {
        const first = focusableRef.current[0]
        const last  = focusableRef.current[focusableRef.current.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus() }
        } else {
          if (document.activeElement === last)  { e.preventDefault(); first.focus() }
        }
      }
    }

    // Cal.com fires a postMessage when the user closes or finishes booking;
    // this restores focus to the trigger even when Escape is pressed inside
    // the iframe (where the keydown listener can't reach).
    const handleCalMessage = (e) => {
      if (e.origin !== 'https://cal.com' && e.origin !== 'https://app.cal.com') return
      if (e.data?.type === 'cal:close' || e.data?.type === '__closeModal') {
        handleClose()
      }
      // Desktop uses a fixed-height iframe; only narrow layouts read iframeHeight,
      // so skip the state update (and re-render) when it wouldn't be used.
      if (isNarrowLayout && e.data?.type === '__dimensionChanged' && e.data?.data?.iframeHeight) {
        // Floor raised to 400 — Cal.com fires transient near-zero heights during
        // reflow; clamping to 200 would collapse the iframe with no recovery affordance.
        setIframeHeight(Math.min(3000, Math.max(400, e.data.data.iframeHeight - 40)))
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('message', handleCalMessage)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('message', handleCalMessage)
      cancelAnimationFrame(raf)
      // Safety net: restore scroll if the component unmounts while modal is still open
      // (i.e. handleClose hasn't already cleared the dataset key).
      if (document.body.dataset.scrollY !== undefined) releaseScrollLock()
    }
  }, [open, handleClose])

  const handleOpen = () => {
    if (open || isOpeningRef.current) return
    isOpeningRef.current = true
    triggerRef.current = document.activeElement
    const scrollY = window.scrollY
    document.body.dataset.scrollY = String(scrollY)
    document.body.style.position  = 'fixed'
    document.body.style.top       = `-${scrollY}px`
    document.body.style.width     = '100%'
    initCal()
    setOpen(true)
  }

  const isNarrowLayout = isMobile || isTablet

  const backdropStyle = {
    position:        'fixed',
    inset:           0,
    background:      'var(--color-surface-blur)',
    backdropFilter:  'blur(4px)',
    zIndex:          9999,
    overscrollBehavior: 'none',
    ...(isNarrowLayout && {
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        isMobile ? '20px' : '40px',
    }),
  }

  const frameStyle = isNarrowLayout ? {
    ...FRAME_BASE,
    position:  'relative',
    width:     '100%',
    maxWidth:  '860px',
    height:    isMobile ? 'calc(100vh - 40px)' : 'calc(100vh - 80px)',
    maxHeight: '800px',
  } : {
    ...FRAME_BASE,
    position: 'absolute',
    top:      '64px',
    bottom:   '64px',
    left:     '160px',
    right:    '160px',
  }

  const overlay = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={SPRING_SNAP}
          style={backdropStyle}
        >
          <motion.div
            key="frame"
            ref={frameRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-dialog-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={SPRING_SNAP}
            style={frameStyle}
          >
            <h2 id="booking-dialog-title" className="sr-only">Book a call with Ily Ameur</h2>
            <div style={{
              position: 'absolute',
              top:      '16px',
              zIndex:   10,
              ...(isMobile ? { right: '16px' } : { left: '16px' }),
            }}>
              <CloseButton ref={closeButtonRef} onClick={handleClose} />
            </div>

            {/* Spinner shown while iframe loads */}
            {!iframeLoaded && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div role="status" aria-label="Loading calendar" className="booking-spinner" />
              </div>
            )}

            {/* allow-same-origin is required by Cal.com for auth/cookie access.
                Mobile/tablet: scrollable wrapper + dynamic height from Cal.com postMessages.
                Desktop: iframe fills container, overflow:hidden clips the footer bar. */}
            {isNarrowLayout ? (
              <div style={{
                height:                  '100%',
                overflowY:               'auto',
                WebkitOverflowScrolling: 'touch',
                touchAction:             'pan-y',
              }}>
                <iframe
                  src="https://cal.com/ily2a/intro?embed=true"
                  title="Book a call with Ily Ameur"
                  width="100%"
                  height={iframeHeight}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  onLoad={() => setIframeLoaded(true)}
                  className="block border-0 w-full"
                />
              </div>
            ) : (
              <iframe
                src="https://cal.com/ily2a/intro?embed=true"
                title="Book a call with Ily Ameur"
                width="100%"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                onLoad={() => setIframeLoaded(true)}
                className="block border-0 w-full h-[calc(100%+80px)]"
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <motion.button
        initial={isStatic ? false : { opacity: 0, scale: 0.5 }}
        animate={{
          opacity: 1,
          scale: 1,
          boxShadow: '0 10px 30px -10px color-mix(in oklch, var(--color-amethyst-400) 55%, transparent), inset 0 0 0 1px var(--color-spotlight)',
        }}
        whileHover={HOVER_LIFT}
        whileTap={{
          y: 0,
          boxShadow: 'inset 0 0 0 1px var(--color-brand), inset 0 3px 6px var(--color-brand), inset 0 -3px 6px var(--color-brand), inset 3px 0 6px var(--color-brand), inset -3px 0 6px var(--color-brand)',
          transition: SPRING_SNAP,
        }}
        transition={{ ...SPRING_ENTRANCE, delay: isStatic ? 0 : HERO_BUTTON_DELAY }}
        onClick={handleOpen}
        aria-label="Book a call"
        style={{
          background: 'linear-gradient(to bottom, var(--color-amethyst-100), var(--color-amethyst-400))',
        }}
        className="inline-flex items-center justify-center h-11 px-4 rounded-[8px] cursor-pointer border-0 text-amethyst-950"
      >
        <span className="btn-label leading-none">Book a call</span>
      </motion.button>

      {mounted && createPortal(overlay, document.body)}
    </>
  )
}
