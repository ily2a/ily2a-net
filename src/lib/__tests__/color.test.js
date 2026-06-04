import { describe, it, expect } from 'vitest'
import { hexToRgbNormalized } from '@/lib/color'

describe('hexToRgbNormalized', () => {
  it('converts #RRGGBB to a 0..1 normalized [r, g, b]', () => {
    expect(hexToRgbNormalized('#ff8000')).toEqual([1, 128 / 255, 0])
  })

  it('accepts hex with or without the leading #', () => {
    expect(hexToRgbNormalized('ffffff')).toEqual([1, 1, 1])
    expect(hexToRgbNormalized('#ffffff')).toEqual([1, 1, 1])
  })

  it('maps #000000 to [0, 0, 0]', () => {
    expect(hexToRgbNormalized('#000000')).toEqual([0, 0, 0])
  })

  it('guards a short/malformed string — pads instead of yielding NaN channels', () => {
    // 'abc' -> padEnd -> 'abc000' -> [0xab, 0xc0, 0x00]
    const rgb = hexToRgbNormalized('#abc')
    expect(rgb).toEqual([0xab / 255, 0xc0 / 255, 0])
    for (const channel of rgb) {
      expect(Number.isFinite(channel)).toBe(true)
      expect(channel).toBeGreaterThanOrEqual(0)
      expect(channel).toBeLessThanOrEqual(1)
    }
  })

  it('maps an empty string to [0, 0, 0] with no NaN', () => {
    expect(hexToRgbNormalized('')).toEqual([0, 0, 0])
  })
})
