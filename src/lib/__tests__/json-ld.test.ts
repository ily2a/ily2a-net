import { describe, it, expect } from 'vitest'
import { safeJsonLd } from '@/lib/json-ld'

// Output is injected via dangerouslySetInnerHTML inside a <script type="application/ld+json">.
// Its only job is to ensure a string field can't close the script tag.
describe('safeJsonLd', () => {
  it('escapes a </script> breakout attempt in a string field', () => {
    const out = safeJsonLd({ name: '</script><img src=x onerror=alert(1)>' })
    expect(out).not.toContain('</script>')
    expect(out).not.toContain('<')
    expect(out).not.toContain('>')
  })

  it('escapes <, >, and & to their \\u sequences', () => {
    const out = safeJsonLd({ a: '<', b: '>', c: '&' })
    expect(out).toContain('\\u003c')
    expect(out).toContain('\\u003e')
    expect(out).toContain('\\u0026')
  })

  it('round-trips back to the original object via JSON.parse', () => {
    // The escapes are valid JSON string escapes, so parsing must recover the
    // original values (& escaping must not corrupt the < sequences).
    const obj = { title: 'A & B <tag>', n: 3, nested: { x: '>' } }
    expect(JSON.parse(safeJsonLd(obj))).toEqual(obj)
  })
})
