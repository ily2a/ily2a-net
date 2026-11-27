'use client'

import { useLayoutEffect, useRef, useState, type RefObject } from 'react'
import Image from 'next/image'
import { AnimatePresence, m } from 'motion/react'
import { MEAL_TYPES, type Dish, type Week } from '../data'
import { asset, DayTargets, MaskIcon, MealCard, Svg, TabBar, TerciaryButton } from '../ui'

// Planner Home (Figma › Food planner › Planner Home): this week's
// calendar, the day's targets and meals. The frame's check-in card and help
// shortcuts are left out. Tapping a day swaps the meals; the arrows page
// between the two weeks.

interface HomeProps {
  week: Week
  weekIndex: number
  weekCount: number
  dayIndex: number
  onWeek: (index: number) => void
  onDay: (index: number) => void
  onShoppingList: () => void
  onOpenDish: (dish: Dish) => void
  /** Where the Planner was scrolled to, so coming back from a meal lands in the same place. */
  savedScrollRef: RefObject<number>
}

// Pages slide in from the side you're moving towards: next week or a later
// day comes in from the right and pushes the old one out to the left.
const PAGE = {
  enter: (dir: number) => ({ x: `${dir * 100}%` }),
  center: { x: '0%' },
  exit: (dir: number) => ({ x: `${dir * -100}%` }),
}
// The date range doesn't slide: it flips in place on its line, like turning a
// calendar page. Next week rolls up from below, last week drops in from above.
const FLIP = {
  enter: (dir: number) => ({ y: `${dir * 100}%`, opacity: 0, filter: 'blur(2px)' }),
  center: { y: '0%', opacity: 1, filter: 'blur(0px)' },
  exit: (dir: number) => ({ y: `${dir * -100}%`, opacity: 0, filter: 'blur(2px)' }),
}
const FLIP_EASE = { duration: 0.3, ease: [0.23, 1, 0.32, 1] } as const
const PAGE_SPRING = { type: 'spring', stiffness: 380, damping: 40 } as const


export function Home({ week, weekIndex, weekCount, dayIndex, onWeek, onDay, onShoppingList, onOpenDish, savedScrollRef }: HomeProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = savedScrollRef.current
  }, [savedScrollRef])

  const day = week.days[dayIndex]!
  const canPrev = weekIndex > 0
  const canNext = weekIndex < weekCount - 1
  const [dir, setDir] = useState(1)

  const goWeek = (to: number) => { setDir(Math.sign(to - weekIndex)); onWeek(to) }
  const goDay = (to: number) => { if (to !== dayIndex) { setDir(Math.sign(to - dayIndex)); onDay(to) } }

  return (
    <div className="absolute inset-0 flex flex-col bg-(--bare-bg-screen) pt-11">
      <div
        ref={scrollRef}
        onScroll={e => { savedScrollRef.current = e.currentTarget.scrollTop }}
        className="flex flex-1 flex-col items-center gap-5 overflow-y-auto overscroll-contain px-4 py-5"
      >
        <h2 tabIndex={-1} className="sr-only">Planner</h2>
        <Svg src="logo.svg" width={90.67} height={24.03} />

        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src={asset('avatar.webp')} alt="" width={48} height={48} className="size-12 rounded-full" />
            <div className="flex flex-col whitespace-nowrap">
              <span className="text-[14px] leading-5 text-(--bare-text-secondary)">Good morning,</span>
              <span className="text-[18px] leading-7 font-medium">Leah</span>
            </div>
          </div>
          <span aria-hidden className="relative size-10">
            <Svg src="settings.svg" width={44} height={44} className="absolute -top-px -left-0.5" />
          </span>
        </div>

        <section aria-labelledby="bare-plan" className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <h3 id="bare-plan" className="text-[18px] leading-7 font-semibold">Your current plan</h3>
                {/* The date range flips with the week, clipped to its line. */}
                <div className="relative h-[18px] overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                    <m.p key={week.range} custom={dir} variants={FLIP} initial="enter" animate="center" exit="exit"
                      transition={FLIP_EASE} className="text-[12px] leading-[18px] whitespace-nowrap text-(--bare-text-brand)">
                      {week.range}
                    </m.p>
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <WeekArrow dir={-1} enabled={canPrev} onClick={() => goWeek(weekIndex - 1)} />
                <WeekArrow dir={1} enabled={canNext} onClick={() => goWeek(weekIndex + 1)} />
              </div>
            </div>

            {/* The week's days slide in edge to edge, so the strip spans the screen while it moves. */}
            <div className="relative -mx-4 h-16 overflow-x-clip">
              <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                <m.div
                  key={weekIndex}
                  role="radiogroup"
                  aria-label={`Day, ${week.range}`}
                  className="relative grid h-16 w-full grid-cols-7 px-4"
                  custom={dir}
                  variants={PAGE}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={PAGE_SPRING}
                >
                  {/* The lime highlight glides to the picked day. It's one seventh of the
                      row wide and moves in steps of its own width, so it stays centred on
                      its day at any row width (49px cells at the design's 343px). */}
                  <m.span
                    aria-hidden
                    className="absolute top-0 left-4 h-16 w-[calc((100%-32px)/7)] rounded-[8px] bg-(--bare-brand-secondary)"
                    initial={false}
                    animate={{ x: `${dayIndex * 100}%` }}
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                  {week.days.map((d, i) => {
                    const active = i === dayIndex
                    return (
                      <m.button
                        key={d.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-label={d.long}
                        onClick={() => goDay(i)}
                        whileTap={{ scale: 0.94 }}
                        className="relative flex h-16 flex-col items-center gap-1 py-1"
                      >
                        <span className="relative flex flex-col text-center">
                          <span className="text-[14px] leading-5 text-(--bare-text-secondary)">{d.short}</span>
                          <span className="text-[16px] leading-6 font-medium">{d.num}</span>
                        </span>
                        <Svg src={active ? 'dot-active.svg' : 'dot.svg'} width={7} height={7} className="relative" />
                      </m.button>
                    )
                  })}
                </m.div>
              </AnimatePresence>
            </div>
          </div>
          <DayTargets macros={day.targets} />
        </section>

        <section aria-labelledby="bare-meals" className="flex w-full flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 id="bare-meals" className="text-[18px] leading-7 font-semibold">Meals</h3>
            <TerciaryButton onClick={onShoppingList}>
              <Svg src="icon-basket.svg" width={22.5} height={18.5} />
              Shopping list
            </TerciaryButton>
          </div>
          {/* The day's meals follow the calendar: a later day slides in from the right. */}
          <div className="relative -mx-4 overflow-x-clip">
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <m.div
                key={day.id}
                className="flex flex-col gap-3 px-4 pb-px"
                custom={dir}
                variants={PAGE}
                initial="enter"
                animate="center"
                exit="exit"
                transition={PAGE_SPRING}
              >
                {MEAL_TYPES.map(t => {
                  const meal = day.meals.find(x => x.type === t.id)
                  return meal ? <MealCard key={meal.id} type={t.id} label={t.label} dishes={meal.dishes} onOpen={onOpenDish} /> : null
                })}
              </m.div>
            </AnimatePresence>
          </div>
        </section>
      </div>
      <TabBar />
    </div>
  )
}

function WeekArrow({ dir, enabled, onClick }: { dir: 1 | -1; enabled: boolean; onClick: () => void }) {
  return (
    <m.button
      type="button"
      aria-label={dir < 0 ? 'Previous week' : 'Next week'}
      disabled={!enabled}
      onClick={onClick}
      whileTap={enabled ? { scale: 0.88 } : undefined}
      className={`-m-2.5 flex size-11 items-center justify-center transition-colors duration-150 ${
        enabled ? 'text-(--bare-text-brand)' : 'text-(--bare-icon-inactive)'
      }`}
    >
      <MaskIcon src="arrow-right.svg" width={17.5} height={11.5} className={dir < 0 ? 'rotate-180' : ''} />
    </m.button>
  )
}
