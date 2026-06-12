'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { m } from 'framer-motion'
import BookingDialog from '@/components/buttons/BookingDialog'
import { useWindowWidth } from '@/hooks/useWindowWidth'
import { pushModalOpen, popModalOpen } from '@/lib/modal-store'
import { SPRING_SNAP, SPRING_ENTRANCE, HERO_BUTTON_DELAY, HOVER_LIFT } from '@/constants/animations'
import { BREAKPOINTS } from '@/constants/layout'

function releaseScrollLock() {
  // No-op when no lock is active — guards against an errant window.scrollTo(0, 0)
  // if called without a saved position (e.g. the lock was already released).
  if (document.body.dataset.scrollY === undefined) return
  const scrollY = parseInt(document.body.dataset.scrollY, 10)
  document.body.style.position = ''
  document.body.style.top      = ''
  document.body.style.width    = ''
  delete document.body.dataset.scrollY
  window.scrollTo(0, Number.isNaN(scrollY) ? 0 : scrollY)
}

// Iframe is considered failed if it hasn't fired onLoad within this window.
const IFRAME_LOAD_TIMEOUT_MS = 15_000

export default function BookingButton({ static: isStatic = false }: { static?: boolean }) {
  const [open, setOpen]               = useState(false)
  const [mounted, setMounted]         = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [iframeError, setIframeError]   = useState(false)
  const [iframeHeight, setIframeHeight] = useState(600)

  const width          = useWindowWidth()
  const isMobile       = width > 0 && width < BREAKPOINTS.MD
  const isTablet       = width >= BREAKPOINTS.MD && width < BREAKPOINTS.LG
  const isNarrowLayout = isMobile || isTablet

  // Cal.com is initialised lazily. Bundle is prefetched on first hover/focus
  // so the network + parse cost is off the critical click→paint path.
  const calInitialized   = useRef(false)
  // prefetchAttempted is sticky — never reset on failure. Repeatedly hovering
  // the trigger over a flaky network must not retry the dynamic import on
  // every pointerenter/focus. calInitialized still resets so a click can
  // reattempt init even after a prefetch failed.
  const prefetchAttempted = useRef(false)
  const closeButtonRef  = useRef<HTMLButtonElement>(null)
  const frameRef        = useRef<HTMLDivElement>(null)    // modal content container for focus trap
  const iframeRef       = useRef<HTMLIFrameElement>(null) // iframe element — used to validate postMessage source
  const triggerRef      = useRef<HTMLElement | null>(null) // element that opened the modal — restored on close
  const focusableRef    = useRef<HTMLElement[]>([])       // cached focusable elements — queried once on open
  const isOpeningRef    = useRef(false)                   // synchronous open guard — blocks double-click before state settles
  // Tracks whether this component currently contributes to the global modal
  // counter (useModalOpen). Set sync in handleOpen, cleared in handleClose.
  // Cleanup pops via this flag — not via dataset.scrollY — because the body-
  // style mutation runs in rAF, and an unmount between push and rAF would
  // otherwise leak the count permanently.
  const modalCounterRef = useRef(false)
  // Stores the open-rAF handle so unmount can cancel a pending body-style
  // mutation that hasn't fired yet.
  const openRafRef      = useRef<number | null>(null)

  const initCal = async () => {
    if (calInitialized.current) return
    calInitialized.current = true
    try {
      const { getCalApi } = await import('@calcom/embed-react')
      const cal = await getCalApi()
      cal('ui', {
        theme: 'dark',
        // Cal.com types require every theme key, but it accepts a single theme
        // at runtime — we only style dark. Cast keeps the dark-only config.
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
        } as Record<string, Record<string, string>>,
        hideEventTypeDetails: false,
        layout: 'month_view',
      })
    } catch {
      // Cal.com failed to load — modal still renders the iframe directly.
      // Reset the flag so the next open can reattempt initialisation.
      calInitialized.current = false
    }
  }

  const prefetchCal = () => {
    if (prefetchAttempted.current) return
    prefetchAttempted.current = true
    import('@calcom/embed-react').catch(() => {})
  }

  // Mount flag for the portal — must flip after mount, can't read during SSR.
  // react-doctor-disable-next-line react-doctor/no-initialize-state
  useEffect(() => { setMounted(true) }, [])

  // Reset iframe state each time modal opens
  useEffect(() => {
    if (open) { setIframeLoaded(false); setIframeError(false); setIframeHeight(600) }
  }, [open])

  // If the iframe doesn't load within the timeout, surface an error UI so the
  // spinner doesn't hang indefinitely on flaky networks or Cal.com outages.
  useEffect(() => {
    if (!open || iframeLoaded || iframeError) return
    const t = setTimeout(() => setIframeError(true), IFRAME_LOAD_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [open, iframeLoaded, iframeError])

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
      frameRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    )
  }, [open, iframeLoaded])

  const handleClose = useCallback(() => {
    // Cancel a pending open-rAF so it can't apply the body lock after we've closed
    // (open-then-immediately-close within one frame).
    if (openRafRef.current !== null) {
      cancelAnimationFrame(openRafRef.current)
      openRafRef.current = null
    }
    releaseScrollLock()
    if (modalCounterRef.current) {
      popModalOpen()
      modalCounterRef.current = false
    }
    setOpen(false)
    isOpeningRef.current = false
    triggerRef.current?.focus({ preventScroll: true })
    triggerRef.current = null
  }, [])

  // Focus management + focus trap + Escape handler when modal is open.
  // Deps are intentional (handleClose is stable; listeners read live state); see eslint-disable on the deps line.
  // react-doctor-disable-next-line react-doctor/exhaustive-deps
  useEffect(() => {
    if (!open) { focusableRef.current = []; return }

    // rAF: element is in DOM immediately after AnimatePresence mounts it
    const raf = requestAnimationFrame(() => {
      closeButtonRef.current?.focus()
    })

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { handleClose(); return }

      // Focus trap — cycle within modal
      if (e.key === 'Tab' && focusableRef.current.length) {
        const first = focusableRef.current[0]
        const last  = focusableRef.current[focusableRef.current.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last?.focus() }
        } else {
          if (document.activeElement === last)  { e.preventDefault(); first?.focus() }
        }
      }
    }

    // Cal.com fires a postMessage when the user closes or finishes booking;
    // this restores focus to the trigger even when Escape is pressed inside
    // the iframe (where the keydown listener can't reach).
    const handleCalMessage = (e: MessageEvent) => {
      if (e.origin !== 'https://cal.com' && e.origin !== 'https://app.cal.com') return
      // Validate source identity — origin alone allows any nested iframe on
      // the page from cal.com to spoof events at this listener. Reject if
      // the ref is null too: when iframeError tears the iframe out of the
      // DOM, the listener stays attached for one more render, and a null ref
      // must not silently pass (would let any cal.com-origin frame trigger
      // close/dimension-change at this handler).
      if (!iframeRef.current || e.source !== iframeRef.current.contentWindow) return
      if (e.data?.type === 'cal:close' || e.data?.type === '__closeModal') {
        handleClose()
      }
      // Desktop uses a fixed-height iframe; only narrow layouts read iframeHeight,
      // so skip the state update (and re-render) when it wouldn't be used.
      // e.data is `any` (MessageEvent) — narrow to a finite number before the
      // arithmetic so a malformed message can't set height to NaN.
      const reportedHeight = e.data?.data?.iframeHeight
      if (isNarrowLayout && e.data?.type === '__dimensionChanged' && typeof reportedHeight === 'number' && Number.isFinite(reportedHeight)) {
        // Floor raised to 400 — Cal.com fires transient near-zero heights during
        // reflow; clamping to 200 would collapse the iframe with no recovery affordance.
        setIframeHeight(Math.min(3000, Math.max(400, reportedHeight - 40)))
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('message', handleCalMessage)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('message', handleCalMessage)
      cancelAnimationFrame(raf)
    }
  }, [open, handleClose, isNarrowLayout])

  // Unmount-only safety net. Runs ONLY when the component leaves the tree — never
  // on an `open`/`isNarrowLayout` effect re-run. A resize across the LG breakpoint
  // while the modal is open must NOT release the scroll lock or pop the modal
  // counter (that would unlock the page behind the open dialog and resume the
  // background WebGL). The two conditions are independent: a sync push +
  // unmount-before-rAF leaves modalCounterRef true while dataset.scrollY is undefined.
  useEffect(() => {
    return () => {
      if (openRafRef.current !== null) {
        cancelAnimationFrame(openRafRef.current)
        openRafRef.current = null
      }
      releaseScrollLock()
      if (modalCounterRef.current) {
        popModalOpen()
        modalCounterRef.current = false
      }
    }
  }, [])

  const handleOpen = () => {
    if (open || isOpeningRef.current) return
    isOpeningRef.current = true
    triggerRef.current = document.activeElement as HTMLElement | null
    // Capture scroll position synchronously (need it before React re-renders
    // and the body style change moves the page), but defer the actual layout
    // mutation + Cal.com bundle load to RAF so the spinner can paint first.
    const scrollY = window.scrollY
    modalCounterRef.current = true
    pushModalOpen()
    setOpen(true)
    openRafRef.current = requestAnimationFrame(() => {
      openRafRef.current = null
      document.body.dataset.scrollY = String(scrollY)
      document.body.style.position  = 'fixed'
      document.body.style.top       = `-${scrollY}px`
      document.body.style.width     = '100%'
      initCal()
    })
  }

  return (
    <>
      <m.button
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
        onPointerEnter={prefetchCal}
        onFocus={prefetchCal}
        aria-label="Book a call"
        style={{
          background: 'linear-gradient(to bottom, var(--color-amethyst-100), var(--color-amethyst-400))',
        }}
        className="inline-flex items-center justify-center h-11 px-4 rounded-[8px] cursor-pointer border-0 text-amethyst-950"
      >
        <span className="btn-label leading-none">Book a call</span>
      </m.button>

      {mounted && createPortal(
        <BookingDialog
          open={open}
          onClose={handleClose}
          isMobile={isMobile}
          isNarrowLayout={isNarrowLayout}
          frameRef={frameRef}
          closeButtonRef={closeButtonRef}
          iframeRef={iframeRef}
          iframeLoaded={iframeLoaded}
          iframeError={iframeError}
          iframeHeight={iframeHeight}
          onIframeLoad={() => setIframeLoaded(true)}
          onIframeError={() => setIframeError(true)}
        />,
        document.body,
      )}
    </>
  )
}
