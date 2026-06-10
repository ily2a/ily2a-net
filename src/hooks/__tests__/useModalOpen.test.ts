// useModalOpen exposes a module-level singleton (push/pop/listeners). Each
// test imports a fresh copy via vi.resetModules so module-level openCount
// can't leak between tests.
import { describe, it, expect, vi, beforeEach } from 'vitest'

let mod: typeof import('../useModalOpen')
beforeEach(async () => {
  vi.resetModules()
  mod = await import('../useModalOpen')
})

describe('useModalOpen store', () => {
  it('notifies subscribers on the 0→1 transition only — not on intermediate pushes', () => {
    const listener = vi.fn()
    mod.subscribeToModalOpen(listener)
    mod.pushModalOpen()
    expect(listener).toHaveBeenCalledTimes(1)
    mod.pushModalOpen()
    mod.pushModalOpen()
    // Still 1 — listeners only fire on edge transitions.
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('notifies subscribers on the 1→0 transition only — not on intermediate pops', () => {
    const listener = vi.fn()
    mod.pushModalOpen()
    mod.pushModalOpen()
    mod.pushModalOpen()
    mod.subscribeToModalOpen(listener)
    mod.popModalOpen()
    mod.popModalOpen()
    expect(listener).not.toHaveBeenCalled()
    mod.popModalOpen()
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('clamps at 0 on extra pops — no negative count, no spurious notify', () => {
    const listener = vi.fn()
    mod.subscribeToModalOpen(listener)
    mod.popModalOpen()
    mod.popModalOpen()
    mod.popModalOpen()
    expect(listener).not.toHaveBeenCalled()
    // After underflow attempts, a single push still triggers the 0→1 notify.
    mod.pushModalOpen()
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('unsubscribed listeners are not called', () => {
    const listener = vi.fn()
    const unsubscribe = mod.subscribeToModalOpen(listener)
    unsubscribe()
    mod.pushModalOpen()
    mod.popModalOpen()
    expect(listener).not.toHaveBeenCalled()
  })

  it('handles double-push + single-pop as still-open (no 1→0 notify)', () => {
    const listener = vi.fn()
    mod.subscribeToModalOpen(listener)
    mod.pushModalOpen()
    mod.pushModalOpen()
    mod.popModalOpen()
    // 0→1 fired once on first push; the matching pop still leaves count at 1.
    expect(listener).toHaveBeenCalledTimes(1)
    mod.popModalOpen()
    // Now count returns to 0 — second notify.
    expect(listener).toHaveBeenCalledTimes(2)
  })
})
