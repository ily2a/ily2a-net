import { describe, it, expect } from 'vitest'
import { displayHeightFor } from '@/sanity/lib/image'

// displayHeightFor reserves the cover/body image height so the page doesn't
// shift when the (LCP) image loads. A regression in the crop math silently
// reintroduces layout shift, so the four return paths are pinned here.
describe('displayHeightFor', () => {
  it('falls back when dimensions are missing', () => {
    expect(displayHeightFor(undefined, undefined, 1400, 788)).toBe(788)
  })

  it('falls back when a dimension is zero', () => {
    expect(displayHeightFor(undefined, { width: 0, height: 0, aspectRatio: 1 }, 1400, 788)).toBe(788)
  })

  it('scales by the native ratio when there is no crop', () => {
    // 1600x900 at targetWidth 800 → 800 * 900/1600 = 450
    expect(displayHeightFor(undefined, { width: 1600, height: 900, aspectRatio: 16 / 9 }, 800, 999)).toBe(450)
  })

  it('returns the target width for a square with no crop', () => {
    expect(displayHeightFor(undefined, { width: 1000, height: 1000, aspectRatio: 1 }, 500, 999)).toBe(500)
  })

  it('accounts for an asymmetric crop that reduces height', () => {
    // crop trims 10% top + 10% bottom → croppedHeight 800, croppedWidth 1000
    // 500 * 800/1000 = 400
    const image = { crop: { top: 0.1, bottom: 0.1 } }
    expect(displayHeightFor(image, { width: 1000, height: 1000, aspectRatio: 1 }, 500, 999)).toBe(400)
  })

  it('falls back when the crop is degenerate (insets exceed the image)', () => {
    const image = { crop: { left: 0.6, right: 0.6 } } // croppedWidth <= 0
    expect(displayHeightFor(image, { width: 1000, height: 1000, aspectRatio: 1 }, 500, 788)).toBe(788)
  })
})
