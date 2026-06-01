import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getClientIp, createRateLimiter, timingSafeStringEqual } from '@/lib/api'

// Minimal Request stand-in: only headers.get is used by getClientIp.
function reqWith(headers) {
  return { headers: { get: (k) => (k in headers ? headers[k] : null) } }
}

describe('timingSafeStringEqual', () => {
  it('returns true for equal strings', () => {
    expect(timingSafeStringEqual('hunter2', 'hunter2')).toBe(true)
  })

  it('returns false for differing same-length strings', () => {
    expect(timingSafeStringEqual('hunter2', 'hunter3')).toBe(false)
  })

  it('returns false when attempt is a shorter prefix of expected', () => {
    expect(timingSafeStringEqual('abc', 'abcde')).toBe(false)
  })

  it('returns false when attempt is longer but shares the full expected prefix', () => {
    // copy() truncates to expected length, so bytes match — the length guard
    // is what must reject this. Regression-critical for the auth routes.
    expect(timingSafeStringEqual('abcde', 'abc')).toBe(false)
  })

  it.each([42, null, undefined, {}, ['a'], true])(
    'returns false (no throw) for non-string attempt %p',
    (attempt) => {
      expect(timingSafeStringEqual(attempt, 'expected')).toBe(false)
    },
  )

  it('returns false for non-string expected', () => {
    expect(timingSafeStringEqual('attempt', null)).toBe(false)
  })

  it('handles empty-string edges', () => {
    expect(timingSafeStringEqual('', '')).toBe(true)
    expect(timingSafeStringEqual('', 'x')).toBe(false)
    expect(timingSafeStringEqual('x', '')).toBe(false)
  })
})

describe('createRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
  })
  afterEach(() => vi.useRealTimers())

  it('allows up to `limit` then blocks', () => {
    const limited = createRateLimiter({ limit: 3, windowMs: 1000 })
    expect(limited('ip')).toBe(false) // 1
    expect(limited('ip')).toBe(false) // 2
    expect(limited('ip')).toBe(false) // 3
    expect(limited('ip')).toBe(true)  // 4th over the limit
  })

  it('resets after the window fully elapses', () => {
    const limited = createRateLimiter({ limit: 2, windowMs: 1000 })
    expect(limited('ip')).toBe(false)
    expect(limited('ip')).toBe(false)
    expect(limited('ip')).toBe(true)
    vi.setSystemTime(1001) // past windowMs — all prior hits expire
    expect(limited('ip')).toBe(false)
  })

  it('slides: an old hit rolls off mid-window to free one slot', () => {
    const limited = createRateLimiter({ limit: 2, windowMs: 1000 })
    expect(limited('ip')).toBe(false) // t=0
    vi.setSystemTime(500)
    expect(limited('ip')).toBe(false) // t=500
    expect(limited('ip')).toBe(true)  // t=500, at limit
    vi.setSystemTime(1001) // t=0 hit expires, t=500 hit still live
    expect(limited('ip')).toBe(false) // one slot freed
    expect(limited('ip')).toBe(true)  // full again (500 + 1001)
  })

  it('buckets distinct IPs independently', () => {
    const limited = createRateLimiter({ limit: 1, windowMs: 1000 })
    expect(limited('a')).toBe(false)
    expect(limited('b')).toBe(false) // different IP, own bucket
    expect(limited('a')).toBe(true)
  })

  it('keeps blocking a persistently-abusive IP without the window sliding forward', () => {
    const limited = createRateLimiter({ limit: 1, windowMs: 1000 })
    expect(limited('ip')).toBe(false)
    // Blocked calls must NOT append new timestamps, or an attacker hammering
    // the endpoint would perpetually push the window's end forward.
    vi.setSystemTime(500); expect(limited('ip')).toBe(true)
    vi.setSystemTime(900); expect(limited('ip')).toBe(true)
    vi.setSystemTime(1001); expect(limited('ip')).toBe(false) // original hit expired → recovers
  })
})

describe('getClientIp', () => {
  it('trusts x-real-ip first', () => {
    expect(getClientIp(reqWith({ 'x-real-ip': '9.9.9.9', 'x-forwarded-for': '1.1.1.1' }))).toBe('9.9.9.9')
  })

  it('falls back to the first x-forwarded-for hop', () => {
    expect(getClientIp(reqWith({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }))).toBe('1.2.3.4')
  })

  it('returns "unknown" for a present-but-empty x-forwarded-for', () => {
    expect(getClientIp(reqWith({ 'x-forwarded-for': '' }))).toBe('unknown')
  })

  it('returns "unknown" for a leading-comma x-forwarded-for', () => {
    expect(getClientIp(reqWith({ 'x-forwarded-for': ', 1.2.3.4' }))).toBe('unknown')
  })

  it('returns "unknown" when no IP headers are present', () => {
    expect(getClientIp(reqWith({}))).toBe('unknown')
  })
})
