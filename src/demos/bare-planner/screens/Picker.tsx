'use client'

import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { MEAL_TYPES, pickId, type Day, type Meal, type Week } from '../data'
import { Checkbox, MealCard, PrimaryButton, Svg, TabBar, TextTab, type CheckState } from '../ui'

// Choosing what to shop for (Figma › Food planner › Food diares shopping
// list): the whole week, whole days, whole meals or single dishes. Meal
// checkboxes go Indeterminate when only some of their dishes are picked.

const mealPicks = (meal: Meal) => meal.dishes.map((_, i) => pickId(meal.id, i))
const dayPicks = (day: Day) => day.meals.flatMap(mealPicks)

const stateOf = (ids: string[], picked: ReadonlySet<string>): CheckState => {
  const n = ids.filter(id => picked.has(id)).length
  return n === 0 ? 'unchecked' : n === ids.length ? 'checked' : 'indeterminate'
}

interface PickerProps {
  week: Week
  picked: ReadonlySet<string>
  /** The day to scroll to on open: the one you came from on the Planner. */
  startDayId: string
  onChange: (next: Set<string>) => void
  onBack: () => void
  onCreate: () => void
}

export function Picker({ week, picked, startDayId, onChange, onBack, onCreate }: PickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const all = week.days.flatMap(dayPicks)

  // Open on the day you were looking at, under the screen header.
  useLayoutEffect(() => {
    const box = scrollRef.current
    const section = box?.querySelector<HTMLElement>(`[data-day="${startDayId}"]`)
    const header = box?.querySelector<HTMLElement>('[data-header]')
    if (box && section && section !== box.querySelector('[data-day]')) {
      box.scrollTop = section.offsetTop - (header?.offsetHeight ?? 0) - 8
    }
  }, [startDayId])
  const allPicked = all.every(id => picked.has(id))

  /** Add every id if any is missing, otherwise remove them all. */
  const toggle = (ids: string[]) => {
    const next = new Set(picked)
    const on = !ids.every(id => picked.has(id))
    for (const id of ids) {
      if (on) next.add(id)
      else next.delete(id)
    }
    onChange(next)
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-(--bare-bg-screen) pt-11">
      <div ref={scrollRef} className="relative flex flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-4 pb-5">
        <ScreenHeader className="justify-between">
          <div className="flex items-center gap-4">
            <BackButton onClick={onBack} />
            <h2 tabIndex={-1} className="text-[18px] leading-7 font-semibold">Shopping list</h2>
          </div>
          <TextTab onClick={() => toggle(all)}>{allPicked ? 'Clear all days' : 'Select all days'}</TextTab>
        </ScreenHeader>

        {week.days.map(day => {
          const ids = dayPicks(day)
          const whole = ids.every(id => picked.has(id))
          return (
            <section key={day.id} data-day={day.id} aria-label={day.long} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <h3 className="flex-1 text-[18px] leading-7 font-semibold">{day.long}</h3>
                <TextTab onClick={() => toggle(ids)} aria-label={`${whole ? 'Clear' : 'Select'} all of ${day.long}`}>
                  {whole ? 'Clear day' : 'Select whole day'}
                </TextTab>
              </div>
              {MEAL_TYPES.map(t => {
                const meal = day.meals.find(x => x.type === t.id)
                if (!meal) return null
                const ids = mealPicks(meal)
                return (
                  <MealCard
                    key={meal.id}
                    type={t.id}
                    label={t.label}
                    dishes={meal.dishes}
                    headerAction={
                      <Checkbox state={stateOf(ids, picked)} label={`${t.label}, ${day.long}`} onToggle={() => toggle(ids)} />
                    }
                    dishAction={meal.dishes.length > 1 ? i => (
                      <Checkbox
                        state={picked.has(ids[i]!) ? 'checked' : 'unchecked'}
                        label={`${meal.dishes[i]!.name}, ${day.long}`}
                        onToggle={() => toggle([ids[i]!])}
                      />
                    ) : undefined}
                  />
                )
              })}
            </section>
          )
        })}
      </div>

      <div className="flex flex-col items-center gap-4 bg-(--bare-bg-surface) pt-4">
        <div className="w-full px-4">
          <PrimaryButton disabled={picked.size === 0} onClick={onCreate}>
            {picked.size === 0 ? 'Pick meals to shop for' : `Create shopping list (${picked.size})`}
          </PrimaryButton>
        </div>
        <TabBar />
      </div>
    </div>
  )
}

/**
 * The back button and title row. It stays pinned while the screen scrolls,
 * so Back is always in reach (in the Figma frames it scrolls away).
 */
export function ScreenHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div data-header className={`sticky top-0 z-10 -mx-4 -mb-2 flex shrink-0 items-center gap-4 bg-(--bare-bg-screen) px-4 pt-5 pb-2 ${className}`}>
      {children}
    </div>
  )
}

/** The mint back button beside screen titles. */
export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Back" className="-m-2.5 flex size-11 shrink-0 items-center justify-center">
      <span className="flex size-6 items-center justify-center rounded-[4px] bg-(--bare-button-terciary)">
        <Svg src="icon-back.svg" width={7.5} height={13.5} />
      </span>
    </button>
  )
}
