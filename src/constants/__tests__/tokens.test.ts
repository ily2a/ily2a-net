import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { AMETHYST, BACKGROUND, BREAKPOINTS, RADII } from '@/constants/tokens'

// tokens.ts hand-copies some globals.css @theme values for contexts CSS can't
// reach. Read the real CSS so a value changed on one side only fails here
// instead of drifting silently.
const css = readFileSync(path.resolve(process.cwd(), 'src/app/globals.css'), 'utf8')

function cssVar(name: string): string {
  const value = css.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]
  if (!value) throw new Error(`--${name} not found in globals.css`)
  return value.trim()
}

const px = (name: string) => Number.parseFloat(cssVar(name))
const tokenNames = (prefix: string) =>
  [...css.matchAll(new RegExp(`--${prefix}-([a-z-]+):`, 'g'))].map((m) => m[1]).sort()
// RADII.BUTTON_INSET ↔ --radius-button-inset
const cssName = (key: string) => key.toLowerCase().replaceAll('_', '-')

describe('tokens.ts mirrors globals.css', () => {
  it('BACKGROUND', () => {
    expect(BACKGROUND.toLowerCase()).toBe(cssVar('color-background').toLowerCase())
  })

  it.each(Object.entries(AMETHYST))('AMETHYST[%s]', (step, hex) => {
    expect(hex.toLowerCase()).toBe(cssVar(`color-amethyst-${step}`).toLowerCase())
  })

  it.each(Object.entries(RADII))('RADII.%s', (key, value) => {
    expect(value).toBe(px(`radius-${cssName(key)}`))
  })

  it.each(Object.entries(BREAKPOINTS))('BREAKPOINTS.%s', (key, value) => {
    expect(value).toBe(px(`breakpoint-${cssName(key)}`))
  })

  it('mirrors every --radius-* and --breakpoint-* token', () => {
    expect(tokenNames('radius')).toEqual(Object.keys(RADII).map(cssName).sort())
    expect(tokenNames('breakpoint')).toEqual(Object.keys(BREAKPOINTS).map(cssName).sort())
  })
})
