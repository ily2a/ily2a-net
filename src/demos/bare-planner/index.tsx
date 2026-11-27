'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { Outfit } from 'next/font/google'
import './tokens.css'
import { buildList, pickId, WEEKS, type Dish, type ListSection } from './data'
import { StatusBar } from './ui'
import { Home } from './screens/Home'
import { Picker } from './screens/Picker'
import { List } from './screens/List'
import { Meal } from './screens/Meal'

// BARE Planner → Shopping list, coded from the Figma file's "Food planner"
// section. The flow is:
//
//   Planner home ─ Shopping list → Pick days & meals ─ Create → Shopping list
//    │   ↑ tap a day / page weeks          ↑ Back                 ↓ Share
//    └ tap a dish → Meal (Ingredients / Method) ─ Back → Planner home
//
// The picker opens with the day you were looking at already ticked, and
// keeps your picks when you come back from the list.

const outfit = Outfit({ subsets: ['latin'], weight: ['400', '500', '600'], display: 'swap' })

type ScreenId = 'home' | 'picker' | 'list' | 'meal'

const SLIDE = {
  enter: (dir: number) => ({ x: dir * 48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -48, opacity: 0 }),
}

// Saturday 27, as on the Figma Planner.
const START_DAY = 6

export default function BarePlanner() {
  const [screen, setScreen] = useState<ScreenId>('home')
  const [dir, setDir] = useState(1)
  const [weekIndex, setWeekIndex] = useState(0)
  const [dayIndex, setDayIndex] = useState(START_DAY)
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [sections, setSections] = useState<ListSection[]>([])
  const [openDish, setOpenDish] = useState<Dish | null>(null)
  const homeScroll = useRef(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const navigated = useRef(false)
  const week = WEEKS[weekIndex]!

  const go = (to: ScreenId, d = 1) => { navigated.current = true; setDir(d); setScreen(to) }

  // Move focus to the new screen's heading, but only after someone has
  // navigated: on first load the demo mustn't pull focus or scroll the page.
  useEffect(() => {
    if (!navigated.current) return
    rootRef.current?.querySelector<HTMLElement>(`section[data-screen="${screen}"] h2`)?.focus({ preventScroll: true })
  }, [screen])

  const openPicker = () => {
    const day = week.days[dayIndex]!
    setPicked(new Set(day.meals.flatMap(meal => meal.dishes.map((_, i) => pickId(meal.id, i)))))
    go('picker')
  }

  const createList = () => {
    setSections(buildList(week, picked))
    go('list')
  }

  const render = () => {
    switch (screen) {
      case 'home': return (
        <Home
          week={week}
          weekIndex={weekIndex}
          weekCount={WEEKS.length}
          dayIndex={dayIndex}
          onWeek={setWeekIndex}
          onDay={setDayIndex}
          onShoppingList={openPicker}
          onOpenDish={d => { setOpenDish(d); go('meal') }}
          savedScrollRef={homeScroll}
        />
      )
      case 'picker': return <Picker week={week} picked={picked} startDayId={week.days[dayIndex]!.id} onChange={setPicked} onBack={() => go('home', -1)} onCreate={createList} />
      case 'list': return <List sections={sections} onBack={() => go('picker', -1)} />
      case 'meal': return openDish && <Meal dish={openDish} onBack={() => go('home', -1)} />
    }
  }

  return (
    <div ref={rootRef} className={`bare demo-scope ${outfit.className} absolute inset-0 overflow-hidden`}>
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <m.section
          key={screen}
          data-screen={screen}
          aria-label="BARE app screen"
          className="absolute inset-0"
          custom={dir}
          variants={SLIDE}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        >
          {render()}
        </m.section>
      </AnimatePresence>
      <StatusBar />
    </div>
  )
}
