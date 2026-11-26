import { describe, it, expect } from 'vitest'
import { readdirSync } from 'node:fs'
import path from 'node:path'
import { TESTIMONIALS } from '@/data/testimonials'

// Windows and macOS file systems ignore case, so '/Avatars/x.webp' works locally
// and 404s on Vercel (Linux). readdirSync returns the real names, so walk the
// path and compare every segment case-sensitively.
function existsWithExactCase(publicPath: string): boolean {
  let dir = path.resolve(process.cwd(), 'public')
  for (const segment of publicPath.split('/').filter(Boolean)) {
    if (!readdirSync(dir).includes(segment)) return false
    dir = path.join(dir, segment)
  }
  return true
}

describe('testimonial avatars', () => {
  it.each(TESTIMONIALS.map((t) => t.avatar))('%s exists with this exact case', (avatar) => {
    expect(existsWithExactCase(avatar)).toBe(true)
  })

  it('rejects a path whose case differs', () => {
    expect(existsWithExactCase('/Avatars/matt.webp')).toBe(false)
  })
})
