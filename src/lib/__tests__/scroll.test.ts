// Tests for the lib/scroll.ts identity-guard semantics. We mock framer-motion
// so we can observe stop() calls and onComplete/onStop wiring without a DOM.
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockAnimate = vi.fn()
vi.mock('framer-motion', () => ({
  animate: (...args: unknown[]) => mockAnimate(...args),
}))

type ScrollModule = typeof import('../scroll')
let scrollMod: ScrollModule

beforeEach(async () => {
  mockAnimate.mockReset()
  vi.resetModules()
  // Stub the global window.scrollTo / window.scrollY for the prefers-reduced path.
  globalThis.window = {
    scrollY: 0,
    scrollTo: vi.fn(),
  } as unknown as Window & typeof globalThis
  scrollMod = await import('../scroll')
})

interface MockControls {
  stop: ReturnType<typeof vi.fn>
  opts?: { onComplete: () => void; onStop: () => void }
}

function makeControls(): MockControls {
  return { stop: vi.fn() }
}

describe('scrollToY', () => {
  it('skips animate() and jumps directly when prefersReduced is true', () => {
    scrollMod.scrollToY(500, true)
    expect(mockAnimate).not.toHaveBeenCalled()
    expect(window.scrollTo).toHaveBeenCalledWith(0, 500)
  })

  it('stops the previous controller before starting a new animation', () => {
    const first = makeControls()
    const second = makeControls()
    mockAnimate.mockReturnValueOnce(first).mockReturnValueOnce(second)

    scrollMod.scrollToY(100)
    scrollMod.scrollToY(200)

    expect(first.stop).toHaveBeenCalledTimes(1)
    expect(second.stop).not.toHaveBeenCalled()
  })

  it('onComplete only nulls `current` when current still equals the issuing controller', () => {
    const first = makeControls()
    const second = makeControls()
    mockAnimate
      .mockImplementationOnce((_a: unknown, _b: unknown, opts: MockControls['opts']) => { first.opts = opts; return first })
      .mockImplementationOnce((_a: unknown, _b: unknown, opts: MockControls['opts']) => { second.opts = opts; return second })

    scrollMod.scrollToY(100)
    scrollMod.scrollToY(200)
    // first's onComplete fires after second has already taken over — must NOT
    // reset `current`, otherwise an in-flight scroll would lose its handle.
    first.opts?.onComplete()
    // second.onStop should still be wired against its own controls
    expect(second.opts).toBeDefined()
    // second.onComplete then resets current cleanly
    expect(() => second.opts?.onComplete()).not.toThrow()
  })

  it('returns null on the prefersReduced path', () => {
    expect(scrollMod.scrollToY(0, true)).toBeNull()
  })

  it('returns the controls object on the animated path', () => {
    const controls = makeControls()
    mockAnimate.mockReturnValueOnce(controls)
    expect(scrollMod.scrollToY(100)).toBe(controls)
  })
})

describe('scrollToElement', () => {
  it('returns null when element is falsy', () => {
    expect(scrollMod.scrollToElement(null)).toBeNull()
    expect(scrollMod.scrollToElement(undefined as unknown as Element | null)).toBeNull()
  })

  it('computes target y from element rect + window scroll + offset', () => {
    const controls = makeControls()
    mockAnimate.mockReturnValueOnce(controls)
    window.scrollY = 50
    const el = { getBoundingClientRect: () => ({ top: 200 }) } as unknown as Element
    scrollMod.scrollToElement(el, false, 10)
    // animate() called with from=50, to=200+50+10=260
    expect(mockAnimate).toHaveBeenCalledWith(50, 260, expect.any(Object))
  })
})
