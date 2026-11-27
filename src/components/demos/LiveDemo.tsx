'use client'

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { m, useAnimate, useInView } from 'motion/react'
import { DEMO_CATALOG, isDemoId, type DemoDevice, type DemoMeta } from '@/demos/catalog'
import { DEMO_COMPONENTS } from '@/demos/registry'
import { DeviceFrame } from '@/components/demos/DeviceFrames'
import SilentErrorBoundary from '@/components/errors/SilentErrorBoundary'
import { EASE_OUT, SPRING_SNAP } from '@/constants/animations'
import { BREAKPOINTS } from '@/constants/tokens'

interface LiveDemoProps {
  demo?: string
  caption?: string
}

// Below the tab breakpoint a 1440px web page would be too small to use, so
// a demo built for both frames shows its phone layout there, with no switch.
const NARROW = `(max-width: ${BREAKPOINTS.TAB - 1}px)`
const subscribeNarrow = (onChange: () => void) => {
  const mql = window.matchMedia(NARROW)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}
const getNarrow = () => window.matchMedia(NARROW).matches
// The server renders the wide layout; phones switch to the phone frame on hydration.
const getNarrowOnServer = () => false

const SWITCH_OPTIONS = [
  { device: 'browser', label: 'Web' },
  { device: 'phone', label: 'Mobile' },
] as const

/** Web / Mobile toggle. The chip slides to the picked side. */
function DeviceSwitch({ value, onChange }: { value: DemoDevice; onChange: (device: DemoDevice) => void }) {
  return (
    <div role="group" aria-label="Show the demo as" className="relative grid grid-cols-2 rounded-pill border border-glass-border bg-glass-bg p-0.5">
      <m.span
        aria-hidden
        className="absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-[6px] bg-glass-border shadow-[0_1px_2px_var(--color-shadow)]"
        initial={false}
        animate={{ x: value === 'phone' ? '100%' : '0%' }}
        transition={SPRING_SNAP}
      />
      {SWITCH_OPTIONS.map(option => {
        const active = option.device === value
        return (
          <m.button
            key={option.device}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.device)}
            className="relative min-w-16 cursor-pointer px-3 py-1 text-caption"
            initial={false}
            animate={{ color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
            transition={SPRING_SNAP}
          >
            {option.label}
          </m.button>
        )
      })}
    </div>
  )
}

// A live, coded demo inside a case study. The frame renders straight away
// so the space is reserved and nothing shifts. The demo's chunk and font
// load only when it gets within ~600px of the viewport. A demo that throws
// leaves an empty frame instead of breaking the page.
export default function LiveDemo({ demo, caption }: LiveDemoProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '600px 0px' })
  const narrow = useSyncExternalStore(subscribeNarrow, getNarrow, getNarrowOnServer)
  const [picked, setPicked] = useState<DemoDevice>('browser')
  const [frameRef, animate] = useAnimate<HTMLDivElement>()

  const id = isDemoId(demo) ? demo : null
  const meta: DemoMeta | null = id ? DEMO_CATALOG[id] : null
  const { browser, phone } = meta?.screens ?? {}
  const device: DemoDevice = phone && (!browser || narrow || picked === 'phone') ? 'phone' : 'browser'

  // The new frame fades in. The demo inside stays mounted, so whatever
  // you'd done in it carries over to the other layout.
  const shown = useRef(device)
  useLayoutEffect(() => {
    if (shown.current === device || !frameRef.current) return
    shown.current = device
    animate(frameRef.current, { opacity: [0, 1], y: [8, 0] }, { duration: 0.35, ease: EASE_OUT })
  }, [device, animate, frameRef])

  const screen = device === 'phone' ? phone : browser
  if (!id || !meta || !screen) {
    if (process.env.NODE_ENV !== 'production') console.warn(`[LiveDemo] unknown demo id: ${demo}`)
    return null
  }

  const Demo = DEMO_COMPONENTS[id]
  const content = inView
    ? <SilentErrorBoundary><Demo device={device} /></SilentErrorBoundary>
    : <div className="skeleton absolute inset-0" />

  return (
    <figure ref={ref} className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between gap-3">
        <span className="text-overline text-brand">Live demo · try it</span>
        {browser && phone && !narrow && <DeviceSwitch value={device} onChange={setPicked} />}
      </div>
      <div ref={frameRef}>
        <DeviceFrame device={device} screen={screen} url={meta.url}>{content}</DeviceFrame>
      </div>
      {caption && (
        <figcaption className="text-caption text-text-secondary text-center">{caption}</figcaption>
      )}
    </figure>
  )
}
