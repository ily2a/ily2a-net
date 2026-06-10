// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import BackToTop from '@/components/buttons/BackToTop'

// scrollY is readonly on the DOM lib type, but jsdom (and the beforeAll
// defineProperty below) make it writable at runtime.
const setScrollY = (y: number) => { (window as unknown as { scrollY: number }).scrollY = y }

// Strip Framer Motion so visibility is deterministic (no enter/exit animation
// timing): m.* -> the underlying tag (forwardRef for the spotlight callback
// ref), AnimatePresence -> passthrough so `{visible && <button/>}` mounts and
// unmounts synchronously. The app uses LazyMotion's `m`, not `motion`.
vi.mock('framer-motion', () => ({
  m: new Proxy({}, {
    get: (_t, tag) => React.forwardRef(function MotionMock(props: Record<string, unknown>, ref: React.Ref<HTMLElement>) {
      const { children, initial, animate, exit, transition, whileTap, whileHover, variants, ...rest } = props
      return React.createElement(tag as string, { ref, ...rest }, children as React.ReactNode)
    }),
  }),
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
}))

beforeAll(() => {
  // jsdom lacks these APIs used by the component's hooks.
  Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 0 })
  window.matchMedia = window.matchMedia || (() => ({
    matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
  })) as unknown as typeof window.matchMedia
  global.ResizeObserver = global.ResizeObserver || (class {
    observe() {} unobserve() {} disconnect() {}
  } as unknown as typeof ResizeObserver)
})

beforeEach(() => { setScrollY(0) })
afterEach(() => { cleanup() })

const button = () => screen.queryByRole('button', { name: /back to top/i })

describe('BackToTop visibility', () => {
  it('is hidden on mount when the page is not scrolled', () => {
    render(React.createElement(BackToTop))
    expect(button()).toBeNull()
  })

  it('is visible on mount when the page already loaded scrolled past 400px', () => {
    // Regression: the button used to only update on scroll, so landing mid-page
    // (scroll restoration, hash deep-link) left it hidden until the user scrolled.
    setScrollY(500)
    render(React.createElement(BackToTop))
    expect(button()).not.toBeNull()
  })

  it('appears after scrolling past 400px and hides when scrolling back up', () => {
    render(React.createElement(BackToTop))
    expect(button()).toBeNull()

    setScrollY(401)
    fireEvent.scroll(window)
    expect(button()).not.toBeNull()

    setScrollY(399)
    fireEvent.scroll(window)
    expect(button()).toBeNull()
  })
})
