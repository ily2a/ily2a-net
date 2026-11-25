// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent, act, waitFor } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import BookingButton from '@/components/booking/BookingButton'

// Strip Motion: m.* -> the underlying tag. AnimatePresence keeps the last
// child while `open` is false, which is the exit window where a reused iframe
// would skip onLoad. The app uses LazyMotion's `m` from 'motion/react'.
const motionTags = vi.hoisted(() => new Map<string, React.ForwardRefExoticComponent<React.PropsWithoutRef<Record<string, unknown>> & React.RefAttributes<HTMLElement>>>())

vi.mock('motion/react', () => ({
  m: new Proxy({}, {
    get: (_t, tag) => {
      const name = String(tag)
      const cached = motionTags.get(name)
      if (cached) return cached
      const Comp = React.forwardRef(function MotionMock(props: Record<string, unknown>, ref: React.Ref<HTMLElement>) {
        const { children, initial, animate, exit, transition, whileTap, whileHover, variants, ...rest } = props
        return React.createElement(name, { ref, ...rest }, children as React.ReactNode)
      })
      motionTags.set(name, Comp)
      return Comp
    },
  }),
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => {
    const previous = React.useRef<React.ReactNode>(null)
    if (children) previous.current = children
    return children || previous.current
  },
}))

// getCalApi() injects Cal.com's embed script. Opening the dialog must not
// touch the network; the iframe src is left for jsdom, which does not fetch it.
vi.mock('@calcom/embed-react', () => ({
  getCalApi: () => Promise.resolve(() => {}),
}))

beforeAll(() => {
  // useWindowWidth snapshots window.innerWidth (1024 in jsdom — the tablet
  // band, below LG — so the iframe's height attribute is the live iframeHeight).
  // Re-publish it through the hook's resize listener in case the snapshot was
  // taken before this stub. jsdom does not implement requestAnimationFrame
  // unless pretendToBeVisual is set; handleOpen calls it after the state
  // updates this test observes, so a no-op keeps open/close synchronous.
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: 1024 })
  window.dispatchEvent(new Event('resize'))
  window.requestAnimationFrame = () => 0
  window.cancelAnimationFrame = () => {}
  window.matchMedia = window.matchMedia || (() => ({
    matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
  })) as unknown as typeof window.matchMedia
})

afterEach(() => { cleanup() })

const bookButton = () => screen.getByRole('button', { name: 'Book a call' })

describe('BookingButton', () => {
  it('omits the dialog portal from the server render', () => {
    // useSyncExternalStore's server snapshot is false, so createPortal never
    // runs during SSR and the Cal.com dialog is absent from the HTML.
    const html = renderToString(React.createElement(BookingButton))
    expect(html).not.toContain('role="dialog"')
  })

  it('mounts the booking dialog on the client after the trigger is clicked', () => {
    render(React.createElement(BookingButton))
    fireEvent.click(bookButton())

    const dialog = screen.getByRole('dialog', { name: 'Book a call with Ily Ameur' })
    expect(document.body.contains(dialog)).toBe(true)
  })

  it('resets the iframe error, loading state, and height each time the dialog opens', async () => {
    // React does not subscribe to the iframe error event, so onError never
    // runs. The failure UI the reset must clear is the 15s load timeout.
    vi.useFakeTimers()
    try {
      render(React.createElement(BookingButton))
      fireEvent.click(bookButton())

      await act(async () => {
        await vi.advanceTimersByTimeAsync(15_000)
      })
      expect(screen.getByRole('alert').textContent).toContain("The calendar couldn't load.")

      fireEvent.click(screen.getByRole('button', { name: 'Close' }))
      fireEvent.click(bookButton())

      expect(screen.queryByRole('alert')).toBeNull()
      expect(screen.queryByText("The calendar couldn't load.")).toBeNull()
      expect(screen.getByRole('status', { name: 'Loading calendar' })).not.toBeNull()
      expect(screen.getByTitle('Book a call with Ily Ameur').getAttribute('height')).toBe('600')
    } finally {
      vi.useRealTimers()
    }
  })

  it('remounts the iframe when the dialog is reopened during the exit window', () => {
    render(React.createElement(BookingButton))
    fireEvent.click(bookButton())
    const first = screen.getByTitle('Book a call with Ily Ameur')
    fireEvent.load(first)
    expect(screen.queryByRole('status', { name: 'Loading calendar' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    fireEvent.click(bookButton())

    const second = screen.getByTitle('Book a call with Ily Ameur')
    expect(second).not.toBe(first)
    expect(first.isConnected).toBe(false)
    expect(screen.getByRole('status', { name: 'Loading calendar' })).not.toBeNull()
  })

  it('closes and resizes from Cal.com fullType messages, and ignores a foreign origin', async () => {
    const main = document.createElement('div')
    main.id = 'main-content'
    document.body.appendChild(main)
    try {
      render(React.createElement(BookingButton))
      fireEvent.click(bookButton())
      expect(main.inert).toBe(true)

      const iframe = screen.getByTitle('Book a call with Ily Ameur') as HTMLIFrameElement
      const view = iframe.ownerDocument.defaultView!
      const source = iframe.contentWindow
      expect(source).not.toBeNull()
      const post = (data: unknown, origin: string) => {
        view.dispatchEvent(new view.MessageEvent('message', { data, origin, source }))
      }

      act(() => { post({ fullType: 'CAL::__closeIframe' }, 'https://evil.example') })
      expect(main.inert).toBe(true)

      act(() => {
        post(
          { fullType: 'CAL::__dimensionChanged', data: { iframeHeight: 800 } },
          'https://app.cal.com',
        )
      })
      await waitFor(() => {
        expect(screen.getByTitle('Book a call with Ily Ameur').getAttribute('height')).toBe('760')
      })

      act(() => { post({ type: 'cal:close' }, 'https://cal.com') })
      await waitFor(() => { expect(main.inert).toBe(false) })
    } finally {
      main.remove()
    }
  })
})
