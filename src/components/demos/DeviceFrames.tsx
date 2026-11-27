'use client'

import { useLayoutEffect, useRef, type ReactNode } from 'react'
import type { DemoDevice, DemoScreen } from '@/demos/catalog'
import { DemoDeviceContext } from '@/demos/device'

// Demos are built at their exact design size (e.g. phone 375×812, web
// 1440×1024). The frame scales that fixed screen to whatever width the
// column gives it, so demo code can use the design's pixel values directly
// and still fit. The screen is `isolate overflow-hidden`, so demos can
// position sheets and overlays against it like a viewport.

/** Scales a fixed-size screen to the width of its box. */
function ScaledScreen({ width, height, className = '', children }: DemoScreen & { className?: string; children: ReactNode }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)

  // Written straight to the DOM: resizing doesn't re-render the demo, and
  // when the design size changes (Web ↔ Mobile) the new scale is in place
  // before the browser paints.
  useLayoutEffect(() => {
    const box = boxRef.current
    const screen = screenRef.current
    if (!box || !screen) return
    const fit = (boxWidth: number) => {
      screen.style.transform = `scale(${boxWidth / width})`
      screen.style.visibility = boxWidth > 0 ? 'visible' : 'hidden'
    }
    fit(parseFloat(getComputedStyle(box).width) || 0)
    const ro = new ResizeObserver(([entry]) => {
      if (entry) fit(entry.contentRect.width)
    })
    ro.observe(box)
    return () => ro.disconnect()
  }, [width])

  return (
    <div ref={boxRef} className={`relative w-full overflow-hidden ${className}`} style={{ aspectRatio: `${width} / ${height}` }}>
      {/* Hidden until measured, so it never flashes at the wrong size. */}
      <div ref={screenRef} className="invisible absolute top-0 left-0 isolate overflow-hidden origin-top-left" style={{ width, height }}>
        {children}
      </div>
    </div>
  )
}

// Visitors should see the whole demo without scrolling, so a frame is never
// taller than the viewport less this: the floating nav at the bottom (24px
// offset, 64px pill, a 24px gap above it) and 24px of room on top.
const CLEARANCE = 136

// What each frame adds around its screen, in px. The phone bezel: 10px of
// padding and a 1px border on each side. The browser window: a 1px border
// and its 40px address bar.
const CHROME: Record<DemoDevice, { x: number; y: number }> = {
  phone: { x: 22, y: 22 },
  browser: { x: 2, y: 42 },
}

/**
 * How wide a frame may get so all of it fits on screen. Its height follows
 * its width through the screen's aspect ratio, so capping the width caps the
 * height. The phone also stops at its design width. svh, not dvh, so it
 * doesn't rescale as mobile browser bars come and go.
 */
function frameMaxWidth(device: DemoDevice, { width, height }: DemoScreen) {
  const { x, y } = CHROME[device]
  const fit = `calc((100svh - ${CLEARANCE + y}px) * ${width / height} + ${x}px)`
  return device === 'phone' ? `max(220px, min(${width + 20}px, ${fit}))` : `max(360px, ${fit})`
}

interface DeviceFrameProps {
  device: DemoDevice
  screen: DemoScreen
  /** Fake address for the browser frame's URL bar. */
  url?: string
  children: ReactNode
}

/**
 * A phone bezel or a browser window around a demo screen. Both are the same
 * element tree, so switching Web ↔ Mobile restyles the frame around the
 * demo instead of remounting it, and the demo keeps its state.
 */
export function DeviceFrame({ device, screen, url, children }: DeviceFrameProps) {
  const phone = device === 'phone'
  return (
    <div
      // Read by the demo-hover: variant, which keeps hover off inside a phone.
      data-device={device}
      className={`mx-auto w-full border border-glass-border bg-surface shadow-[0_8px_32px_var(--color-shadow-strong)] ${
        phone ? 'rounded-[56px] p-2.5' : 'overflow-hidden rounded-glass'
      }`}
      // The whole frame fits on screen; the phone bezel also hugs its screen.
      style={{ maxWidth: frameMaxWidth(device, screen) }}
    >
      {!phone && (
        <div aria-hidden className="flex items-center gap-3 px-4 h-10 border-b border-glass-border">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-text-subtle" />
            <span className="size-2.5 rounded-full bg-text-subtle" />
            <span className="size-2.5 rounded-full bg-text-subtle" />
          </div>
          {url && (
            <div className="flex-1 max-w-[360px] mx-auto truncate rounded-md bg-glass-bg px-3 py-1 text-center text-caption text-text-secondary">
              {url}
            </div>
          )}
        </div>
      )}
      <ScaledScreen width={screen.width} height={screen.height} className={phone ? 'rounded-[46px] img-outline' : ''}>
        <DemoDeviceContext value={device}>{children}</DemoDeviceContext>
      </ScaledScreen>
    </div>
  )
}
