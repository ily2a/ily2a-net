import { describe, it, expect } from 'vitest'
import { toId, dedupeIds } from '@/lib/portable-text'

// These drive Table-of-Contents anchor ids and their uniqueness. A regression
// silently scrolls deep links to the wrong heading (or nowhere).
describe('toId', () => {
  it('slugifies a normal heading', () => {
    expect(toId('Hello World')).toBe('hello-world')
  })

  it('collapses symbol runs and trims edge dashes', () => {
    expect(toId('C++ & Rust!')).toBe('c-rust')
  })

  it('trims surrounding whitespace', () => {
    expect(toId('  Leading  ')).toBe('leading')
  })

  it('leaves an already-slug id unchanged', () => {
    expect(toId('abc')).toBe('abc')
  })

  it('returns an empty string for an all-symbol heading (documented behavior)', () => {
    // Headings with no [a-z0-9] produce ''. dedupeIds treats '' as falsy and
    // passes it through untouched, so multiple such headings would share id=''.
    // Pinned so any future change here is a conscious one.
    expect(toId('###')).toBe('')
  })
})

describe('dedupeIds', () => {
  it('leaves unique ids unchanged', () => {
    const items = [{ id: 'a' }, { id: 'b' }]
    expect(dedupeIds(items)).toEqual([{ id: 'a' }, { id: 'b' }])
  })

  it('keeps the first occurrence bare and suffixes later collisions', () => {
    const out = dedupeIds([{ id: 'intro' }, { id: 'intro' }, { id: 'intro' }])
    expect(out.map((i) => i.id)).toEqual(['intro', 'intro-2', 'intro-3'])
  })

  it('counts collisions correctly across a gap', () => {
    const out = dedupeIds([{ id: 'a' }, { id: 'b' }, { id: 'a' }])
    expect(out.map((i) => i.id)).toEqual(['a', 'b', 'a-2'])
  })

  it('returns items without an id untouched (same reference)', () => {
    const noId: { id?: string; text: string } = { text: 'x' }
    const out = dedupeIds([noId])
    expect(out[0]).toBe(noId)
  })

  it('does not let a generated suffix collide with a later natural id', () => {
    // Regression: ['foo','foo','foo-2'] previously produced a duplicate 'foo-2'
    // (item 2 renamed to foo-2; item 3 natural foo-2 passed through unchanged).
    // Corrected contract guarantees uniqueness; item 3 yields because item 2
    // already claimed 'foo-2', so it takes the next free slot.
    const out = dedupeIds([{ id: 'foo' }, { id: 'foo' }, { id: 'foo-2' }])
    const ids = out.map((i) => i.id)
    expect(ids).toEqual(['foo', 'foo-2', 'foo-2-2'])
    expect(new Set(ids).size).toBe(ids.length) // no duplicates
  })

  it('keeps all ids unique through an interleaved collision', () => {
    const out = dedupeIds([{ id: 'a' }, { id: 'a' }, { id: 'a-2' }, { id: 'a' }])
    const ids = out.map((i) => i.id)
    expect(ids[0]).toBe('a')
    expect(new Set(ids).size).toBe(ids.length) // the invariant that matters
  })
})
