import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { buildList, ingredientsOf, pickId, sumMacros, WEEKS } from '../data'

const days = WEEKS.flatMap(w => w.days)
const dishesOf = (day: (typeof days)[number]) => day.meals.flatMap(m => m.dishes)

describe('BARE demo meal plan', () => {
  it('keeps calories and protein fixed and moves carbs and fat day to day', () => {
    expect(new Set(days.map(d => d.targets.kcal)).size).toBe(1)
    expect(new Set(days.map(d => d.targets.p)).size).toBe(1)
    expect(new Set(days.slice(0, 7).map(d => d.targets.f)).size).toBe(7)
  })

  it('makes every day’s targets add up: 4 kcal per g of protein and carbs, 9 per g of fat', () => {
    for (const { targets: t } of days) expect(t.p * 4 + t.c * 4 + t.f * 9).toBe(t.kcal)
  })

  it('portions each day’s meals to its targets exactly', () => {
    for (const day of days) expect(sumMacros(dishesOf(day))).toEqual(day.targets)
  })

  it('gives every dish calories that match its macros', () => {
    for (const d of days.flatMap(dishesOf)) {
      expect(d.macros.p * 4 + d.macros.c * 4 + d.macros.f * 9).toBe(d.macros.kcal)
      expect(Math.min(d.macros.p, d.macros.c, d.macros.f)).toBeGreaterThan(0)
    }
  })

  it('serves a different breakfast, main and snack every day', () => {
    const names = days.flatMap(dishesOf).map(d => d.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('sizes each dish’s ingredients to its portion', () => {
    const saturday = WEEKS[0]!.days[6]!
    const eggBites = saturday.meals.flatMap(m => m.dishes).find(d => d.name === 'Ham & Cheddar Egg Bites')!
    // The recipe uses 3 eggs; the portion scales that, to the nearest half.
    const eggs = Math.max(0.5, Math.round(3 * eggBites.scale * 2) / 2)
    expect(ingredientsOf(eggBites).find(i => i.id === 'eggs')?.qty).toBe(`${eggs} pcs`)
  })

  it('merges picked dishes into one list, adding up shared ingredients', () => {
    const week = WEEKS[0]!
    const pick = (dayIndex: number) => week.days[dayIndex]!.meals.flatMap(m => m.dishes.map((_, i) => pickId(m.id, i)))
    const qty = (picked: string[], id: string) =>
      buildList(week, new Set(picked)).flatMap(s => s.items).find(i => i.id === id)?.qty
    // Feta is in Saturday's avocado toasts and Thursday's steak salad: two days need more than one.
    const one = parseFloat(qty(pick(6), 'feta')!)
    const both = parseFloat(qty([...pick(6), ...pick(4)], 'feta')!)
    expect(both).toBeGreaterThan(one)
    expect(buildList(week, new Set())).toEqual([])
  })

  it('gives every dish a method, a cook time and a header photo', () => {
    for (const d of days.flatMap(dishesOf)) {
      expect(d.steps.length).toBeGreaterThan(0)
      expect(d.minutes).toBeGreaterThan(0)
      for (const file of [d.img, d.hero]) expect(existsSync(join('public/demos/bare', file)), file).toBe(true)
    }
  })
})
