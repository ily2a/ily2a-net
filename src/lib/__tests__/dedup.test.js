import { describe, it, expect, beforeEach } from 'vitest'
import { dedupKey, createDedupCache, DEFAULT_DEDUP_TTL } from '../dedup'

describe('dedupKey', () => {
  it('produces the same key for identical inputs under the same secret', () => {
    const a = dedupKey('s', 'a@b.com', 'hello')
    const b = dedupKey('s', 'a@b.com', 'hello')
    expect(a).toBe(b)
  })

  it('produces a different key when the message changes', () => {
    const a = dedupKey('s', 'a@b.com', 'hello')
    const b = dedupKey('s', 'a@b.com', 'goodbye')
    expect(a).not.toBe(b)
  })

  it('produces a different key under a different secret — preimage resistance', () => {
    const a = dedupKey('s1', 'a@b.com', 'hello')
    const b = dedupKey('s2', 'a@b.com', 'hello')
    expect(a).not.toBe(b)
  })

  it('returns a base64url string of length 22', () => {
    const k = dedupKey('s', 'a@b.com', 'hello')
    expect(k).toHaveLength(22)
    expect(k).toMatch(/^[A-Za-z0-9_-]+$/)
  })
})

describe('createDedupCache', () => {
  let clock
  let dedup

  beforeEach(() => {
    clock = { now: 0 }
    dedup = createDedupCache({ ttl: 1000, now: () => clock.now })
  })

  it('returns false on first peek and true on second peek within TTL', () => {
    expect(dedup.isDuplicate('k')).toBe(false)
    dedup.markSent('k')
    expect(dedup.isDuplicate('k')).toBe(true)
  })

  it('returns false again after TTL expires', () => {
    dedup.markSent('k')
    expect(dedup.isDuplicate('k')).toBe(true)
    clock.now = 1001
    expect(dedup.isDuplicate('k')).toBe(false)
  })

  it('does not commit on peek alone — failed-send retry is not suppressed', () => {
    expect(dedup.isDuplicate('k')).toBe(false)
    expect(dedup.isDuplicate('k')).toBe(false)
    expect(dedup.cache.has('k')).toBe(false)
  })

  it('evicts stale entries on a miss but leaves fresh ones in place', () => {
    // old@0 (TTL expires at 1000), fresh@500 (TTL expires at 1500)
    dedup.markSent('old')
    clock.now = 500
    dedup.markSent('fresh')
    // At 1100: old is 1100ms past its insert (stale), fresh is 600ms (alive).
    clock.now = 1100
    expect(dedup.isDuplicate('miss')).toBe(false)
    expect(dedup.cache.has('old')).toBe(false)
    expect(dedup.cache.has('fresh')).toBe(true)
  })

  it('is hit-fast — eviction sweep is skipped on a hit', () => {
    dedup.markSent('hit')
    // Pre-populate a stale entry that would normally be evicted on a miss.
    dedup.cache.set('stale', clock.now - 5000)
    expect(dedup.isDuplicate('hit')).toBe(true)
    // Stale entry survives because the hit short-circuited.
    expect(dedup.cache.has('stale')).toBe(true)
  })

  it('respects DEFAULT_DEDUP_TTL when ttl is omitted', () => {
    const d = createDedupCache({ now: () => clock.now })
    d.markSent('k')
    clock.now = DEFAULT_DEDUP_TTL
    expect(d.isDuplicate('k')).toBe(true)
    clock.now = DEFAULT_DEDUP_TTL + 1
    expect(d.isDuplicate('k')).toBe(false)
  })
})
