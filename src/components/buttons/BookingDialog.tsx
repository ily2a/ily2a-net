'use client'

import type { CSSProperties, RefObject } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import CloseButton from '@/components/buttons/CloseButton'
import { SPRING_SNAP } from '@/constants/animations'

// Single source of truth for the Cal.com booking URL. Used by both iframe
// embeds (with ?embed=true) and the error-fallback "open in a new tab" link.
const CAL_BOOKING_URL = 'https://cal.com/ily2a/intro'
const CAL_EMBED_URL   = `${CAL_BOOKING_URL}?embed=true`

// Shared style for the iframe frame in both narrow and wide layouts. Position-
// dependent properties are merged in below; these five never change.
const FRAME_BASE: CSSProperties = {
  background:     'transparent',
  border:         '1px solid var(--color-brand)',
  borderRadius:   '8px',
  overflow:       'hidden',
  backdropFilter: 'blur(8px)',
}

interface BookingDialogProps {
  open: boolean
  onClose: () => void
  isMobile: boolean
  isNarrowLayout: boolean
  frameRef: RefObject<HTMLDivElement | null>
  closeButtonRef: RefObject<HTMLButtonElement | null>
  iframeRef: RefObject<HTMLIFrameElement | null>
  iframeLoaded: boolean
  iframeError: boolean
  iframeHeight: number
  onIframeLoad: () => void
  onIframeError: () => void
}

/**
 * Presentational booking dialog: backdrop, framed card, spinner / error
 * fallback, and the Cal.com iframe. All open/close orchestration, focus
 * management, scroll-locking and Cal.com lifecycle live in BookingButton and
 * are wired in through props — this component only renders.
 */
export default function BookingDialog({
  open,
  onClose,
  isMobile,
  isNarrowLayout,
  frameRef,
  closeButtonRef,
  iframeRef,
  iframeLoaded,
  iframeError,
  iframeHeight,
  onIframeLoad,
  onIframeError,
}: BookingDialogProps) {
  const backdropStyle: CSSProperties = {
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

  const frameStyle: CSSProperties = isNarrowLayout ? {
    ...FRAME_BASE,
    position:  'relative',
    width:     '100%',
    maxWidth:  '860px',
    // dvh, not vh: on mobile, 100vh includes the area behind the collapsible
    // browser chrome, which clipped the dialog's bottom edge while the URL bar
    // was visible. dvh tracks the actual visible viewport.
    height:    isMobile ? 'calc(100dvh - 40px)' : 'calc(100dvh - 80px)',
    maxHeight: '800px',
  } : {
    ...FRAME_BASE,
    position: 'absolute',
    top:      '64px',
    bottom:   '64px',
    left:     '160px',
    right:    '160px',
  }

  return (
    <AnimatePresence>
      {open && (
        <m.div
          key="backdrop"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={SPRING_SNAP}
          style={backdropStyle}
        >
          <m.div
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
              <CloseButton ref={closeButtonRef} onClick={onClose} />
            </div>

            {/* Spinner shown while iframe loads */}
            {!iframeLoaded && !iframeError && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div role="status" aria-label="Loading calendar" className="booking-spinner" />
              </div>
            )}

            {/* SR-only completion announcement — the spinner gives a
                "loading" hint but doesn't fire a "ready" message when it
                disappears. Screen-reader users would otherwise wait silently. */}
            <div className="sr-only" aria-live="polite">
              {iframeLoaded && !iframeError ? 'Calendar ready' : ''}
            </div>

            {/* Fallback shown if the iframe fails to load or times out — gives
                the user a way out instead of an indefinite spinner. */}
            {iframeError && (
              <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-text-primary">
                <p className="text-notice">The calendar couldn&apos;t load.</p>
                <a
                  href={CAL_BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-notice underline text-brand"
                >
                  Open it in a new tab
                </a>
              </div>
            )}

            {/* allow-same-origin is required by Cal.com for auth/cookie access.
                Mobile/tablet: scrollable wrapper + dynamic height from Cal.com postMessages.
                Desktop: iframe fills container, overflow:hidden clips the footer bar. */}
            {!iframeError && (isNarrowLayout ? (
              <div style={{
                height:                  '100%',
                overflowY:               'auto',
                WebkitOverflowScrolling: 'touch',
                touchAction:             'pan-y',
              }}>
                {/* sandbox is set below; allow-same-origin+scripts is required for Cal.com auth/cookies. */}
                {/* react-doctor-disable-next-line react-doctor/iframe-missing-sandbox */}
                <iframe
                  ref={iframeRef}
                  src={CAL_EMBED_URL}
                  title="Book a call with Ily Ameur"
                  width="100%"
                  height={iframeHeight}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  onLoad={onIframeLoad}
                  onError={onIframeError}
                  className="block border-0 w-full"
                />
              </div>
            ) : (
              // sandbox is set below; allow-same-origin+scripts is required for Cal.com auth/cookies.
              // react-doctor-disable-next-line react-doctor/iframe-missing-sandbox
              <iframe
                ref={iframeRef}
                src={CAL_EMBED_URL}
                title="Book a call with Ily Ameur"
                width="100%"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                onLoad={onIframeLoad}
                onError={onIframeError}
                className="block border-0 w-full h-[calc(100%+80px)]"
              />
            ))}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
