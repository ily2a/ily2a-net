'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, m } from 'motion/react'
import { ingredientsOf, type Dish } from '../data'
import { asset, DayTargets, Svg, TabBar } from '../ui'

// The meal screen (Figma › Food planner › Meal ingredients / Meal method),
// opened by tapping a dish on the Planner. Header photo with cook time and
// diet tags, the dish's macros, then Ingredients and Method tabs. The
// frame's Portion link and Add meal button are left out, and servings stay
// at 1: the plan sizes each portion to the day's targets.

type Tab = 'ingredients' | 'method'
const TABS: { id: Tab; label: string }[] = [
  { id: 'ingredients', label: 'Ingredients' },
  { id: 'method', label: 'Method' },
]

export function Meal({ dish, onBack }: { dish: Dish; onBack: () => void }) {
  const [tab, setTab] = useState<Tab>('ingredients')
  const dir = tab === 'method' ? 1 : -1

  return (
    <div className="absolute inset-0 flex flex-col bg-(--bare-bg-screen)">
      <div className="flex flex-1 flex-col items-center gap-5 overflow-y-auto overscroll-contain pb-5">
        <div className="relative h-80 w-full shrink-0 overflow-hidden rounded-b-[10px]">
          <Image src={asset(dish.hero)} alt="" fill sizes="375px" priority className="object-cover" />
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="absolute top-[50px] left-1.5 flex size-11 items-center justify-center"
          >
            <span className="flex size-6 items-center justify-center rounded-[4px] bg-(--bare-nav-bg)">
              <Svg src="icon-back.svg" width={7.5} height={13.5} />
            </span>
          </button>
          <div className="absolute right-4 bottom-4 flex gap-2">
            <HeroTag icon="icon-timer.svg">{`${dish.minutes} min`}</HeroTag>
            {dish.diet && <HeroTag icon="icon-vegan.svg">{dish.diet}</HeroTag>}
          </div>
        </div>

        <div className="flex w-full flex-col gap-5 px-4">
          <div className="flex flex-col gap-4">
            <h2 tabIndex={-1} className="text-[20px] leading-[30px] font-semibold">{dish.name}</h2>
            <DayTargets macros={dish.macros} />
          </div>

          <div className="flex flex-col gap-4">
            <div role="tablist" aria-label="Recipe" className="relative grid h-[52px] grid-cols-2 gap-1 rounded-[10px] bg-(--bare-bg-surface) p-1">
              {/* The green pill slides to the picked tab. */}
              <m.span
                aria-hidden
                className="absolute top-1 bottom-1 left-1 w-[calc(50%-6px)] rounded-[10px] bg-(--bare-button-primary) shadow-[0_1px_3px_rgba(10,13,18,0.1),0_1px_2px_-1px_rgba(10,13,18,0.1)]"
                initial={false}
                animate={{ x: tab === 'method' ? 'calc(100% + 4px)' : '0%' }}
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
              {TABS.map(t => {
                const active = t.id === tab
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    id={`bare-tab-${t.id}`}
                    aria-selected={active}
                    aria-controls="bare-tabpanel"
                    onClick={() => setTab(t.id)}
                    className={`relative flex items-center justify-center transition-colors duration-200 ${
                      active ? 'text-[16px] leading-6 font-semibold text-(--bare-text-inverse)' : 'text-[14px] leading-5 font-medium text-(--bare-text-brand)'
                    }`}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>

            <div className="relative overflow-x-clip">
              <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                <m.div
                  key={tab}
                  id="bare-tabpanel"
                  role="tabpanel"
                  aria-labelledby={`bare-tab-${tab}`}
                  custom={dir}
                  variants={{
                    enter: (d: number) => ({ x: d * 40, opacity: 0 }),
                    center: { x: 0, opacity: 1 },
                    exit: (d: number) => ({ x: d * -40, opacity: 0 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 420, damping: 38 }}
                  className="flex flex-col gap-4"
                >
                  {tab === 'ingredients' ? <Ingredients dish={dish} /> : <Method dish={dish} />}
                </m.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      <TabBar />
    </div>
  )
}

function HeroTag({ icon, children }: { icon: string; children: string }) {
  return (
    <span className="flex h-7 items-center gap-1 rounded-[8px] bg-(--bare-tag-terciary) px-2 text-[12px] leading-[18px] font-medium text-(--bare-text-brand)">
      <span className="flex size-5 items-center justify-center"><Svg src={icon} width={17.92} height={17.92} /></span>
      {children}
    </span>
  )
}

/** Servings is fixed at one portion, with no stepper: the plan sizes it to the day's targets. */
function Ingredients({ dish }: { dish: Dish }) {
  return (
    <>
      {/* Same row shape as the ingredients below, with the count in a mint brand pill
          so it reads as the plan's setting rather than a stray number. */}
      <p className="flex h-12 items-center justify-between rounded-[10px] bg-(--bare-bg-surface) pr-2 pl-3 text-[14px] leading-5 font-semibold">
        <span>Servings</span>
        <span className="rounded-[10px] bg-(--bare-button-terciary) px-2.5 py-2 text-(--bare-text-brand)">1 portion</span>
      </p>
      <ul className="flex flex-col gap-2">
        {ingredientsOf(dish).map(item => (
          <li key={item.id} className="flex h-12 items-center justify-between gap-2 rounded-[10px] bg-(--bare-bg-surface) px-2">
            <span className="truncate text-[14px] leading-5">{item.name}</span>
            <span className="shrink-0 rounded-[10px] bg-(--bare-bg-subtle) p-2 text-[14px] leading-5 font-medium">{item.qty}</span>
          </li>
        ))}
      </ul>
    </>
  )
}

function Method({ dish }: { dish: Dish }) {
  return (
    <ol className="flex flex-col gap-2">
      {dish.steps.map((step, i) => (
        <li key={step} className="bare-shadow-card flex gap-1.5 bg-(--bare-bg-surface) p-2 text-[14px] leading-5">
          <span className="w-[15px] shrink-0 text-right tabular-nums">{i + 1}.</span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  )
}
