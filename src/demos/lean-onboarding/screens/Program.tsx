'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, m } from 'motion/react'
import { asset, Logo, MaskIcon, PrimaryButton, Screen, SecondaryButton, Svg, Tag } from '../ui'

// The payoff screen: the recommended program, with a week switcher and
// the week's workouts. Scrolls inside the phone like the real app.

const WEEKS = 2 // 15-day program

// The Figma card's expanded state is one sentence repeated as filler.
// This draft only uses what the app itself shows: 40-minute sessions,
// rest days, the meal plan from onboarding and the Progress score.
const DESCRIPTION =
  'Join the LEAN Method Level Up, a 15-day workout guide starting April 13, 2025. It includes Strength, Pilates, and Cardio. Designed by Lilly Sabri to help you get fitter. Every week mixes 40-minute workouts with a rest day built in, so you can train hard and still recover. Your meal plan is built from the answers you just gave, and your Progress score climbs with every session you finish. Enroll and start Day 1 today!'

const COLLAPSED_PX = 80 // 4 lines × 20px, like the collapsed Figma card

type Workout =
  | { id: string; kind: 'workout'; title: string; img: string; /** crop for portrait shots */ pos?: string }
  | { id: string; kind: 'rest' }

// Week 1 photos come from the program frame, week 2 from the set added beside it.
const WEEK_A: Workout[] = [
  { id: 'd1', kind: 'workout', title: 'Lower Body Strength', img: 'workout-1.png' },
  { id: 'd2', kind: 'workout', title: 'Lower Body Strength', img: 'workout-2.png' },
  { id: 'd3', kind: 'rest' },
  { id: 'd4', kind: 'workout', title: 'Lower Body Strength', img: 'workout-4.png' },
  { id: 'd5', kind: 'workout', title: 'Lower Body Strength', img: 'workout-5.png' },
  { id: 'd6', kind: 'workout', title: 'Lower Body Strength', img: 'workout-6.png' },
]
// Named after what each photo shows, across Strength x Pilates x Cardio.
const WEEK_B: Workout[] = [
  { id: 'd1', kind: 'workout', title: 'Full Body Strength', img: 'week2-squat.jpg', pos: 'object-[50%_8%]' },
  { id: 'd2', kind: 'workout', title: 'Upper Body Strength', img: 'week2-row.png' },
  { id: 'd3', kind: 'rest' },
  { id: 'd4', kind: 'workout', title: 'Kickboxing Cardio', img: 'week2-kick.jpg', pos: 'object-[50%_30%]' },
  { id: 'd5', kind: 'workout', title: 'Pilates Core', img: 'week2-legraise.jpg' },
  { id: 'd6', kind: 'workout', title: 'Stretch & Mobility', img: 'week2-seated.jpg', pos: 'object-[50%_40%]' },
]

// Next week slides in from the right; going back brings it in from the left.
const WEEK_SLIDE = {
  enter: (dir: number) => ({ x: `${dir * 105}%` }),
  center: { x: '0%' },
  exit: (dir: number) => ({ x: `${dir * -105}%` }),
}

function WorkoutCard({ workout, day, completed }: { workout: Workout; day: number; completed: boolean }) {
  return (
    <div className="flex flex-col gap-2 overflow-hidden rounded-[2px] border-[0.5px] border-(--lean-border-default) bg-(--lean-card-bg) pb-2">
      <div className="relative h-[136px] w-full">
        {workout.kind === 'rest' ? (
          <>
            <Svg src="rest-bg.svg" width={168} height={136} className="absolute inset-0 h-full w-full" />
            <Svg src="icon-beach.svg" width={58.5} height={58.5} className="absolute top-[38.25px] left-1/2 -translate-x-1/2" />
          </>
        ) : (
          <Image src={asset(workout.img)} alt="" fill sizes="168px" className={`rounded-[2px] object-cover ${workout.pos ?? ''}`} />
        )}
        {completed && <Svg src="icon-check-done.svg" width={20} height={20} className="absolute top-[7.5px] right-2" />}
      </div>
      <div className="flex flex-col gap-2 px-2">
        <p className="text-[14px] leading-5 font-semibold text-(--lean-text-primary)">
          {workout.kind === 'rest' ? 'Rest day' : workout.title}
        </p>
        <div className="flex gap-1">
          <Tag>Day {day}</Tag>
          {completed ? <Tag tone="secondary">Completed</Tag> : <Tag tone="tertiary">{workout.kind === 'rest' ? 'No workout' : '40m'}</Tag>}
        </div>
      </div>
    </div>
  )
}

export function Program({ onStart }: { onStart: () => void }) {
  const [expanded, setExpanded] = useState(false)
  // The 4-line ellipsis comes off before expanding and goes back on only
  // once the collapse finishes, so the height animates over real text.
  const [clamped, setClamped] = useState(true)
  const [week, setWeek] = useState(1)
  const [weekDir, setWeekDir] = useState(1)

  const toggle = () => {
    if (!expanded) setClamped(false)
    setExpanded(!expanded)
  }
  const changeWeek = (by: number) => {
    setWeekDir(by)
    setWeek(week + by)
  }
  const plan = week === 1 ? WEEK_A : WEEK_B

  return (
    <Screen scroll footer={<PrimaryButton onClick={onStart}>Start now</PrimaryButton>}>
      <div className="flex flex-col items-center gap-6">
        <Logo />
        <div className="flex w-full flex-col gap-5">
          <div className="flex flex-col gap-4">
            <div className="relative flex h-[136px] items-end justify-end p-2">
              <Image src={asset('program-banner.png')} alt="LEAN Method Elevate, day 1 to 7" fill sizes="343px" className="object-cover" />
              <Tag tone="secondary" className="relative">Best for your fitness level</Tag>
            </div>
            <div className="flex flex-col gap-2 rounded-[2px] border-[0.3px] border-(--lean-border-default) bg-(--lean-card-bg) p-3">
              <div className="flex items-center justify-between text-[14px] leading-5 font-semibold text-(--lean-text-secondary)">
                <span className="flex h-8 items-center gap-2 rounded-3xl bg-(--lean-tag-primary) px-2">
                  1.9 K <span className="sr-only">members</span>
                  <span className="flex size-5 items-center justify-center"><Svg src="icon-users.svg" width={19.58} height={14.58} /></span>
                </span>
                <span className="flex h-8 items-center rounded-3xl bg-(--lean-tag-primary) px-2">15 days</span>
                <span className="flex h-8 items-center gap-2 rounded-3xl bg-(--lean-tag-primary) px-2">
                  No equipment
                  <span className="flex size-5 items-center justify-center"><Svg src="icon-stretch.svg" width={10} height={16.67} className="-scale-x-100" /></span>
                </span>
              </div>
              <p className="text-[14px] leading-5 text-(--lean-text-muted)">Strength x Pilates x Cardio</p>
              <m.div
                className="overflow-hidden"
                initial={false}
                animate={{ height: expanded ? 'auto' : COLLAPSED_PX }}
                transition={{ type: 'spring', stiffness: 260, damping: 32 }}
                onAnimationComplete={() => { if (!expanded) setClamped(true) }}
              >
                <p id="lean-program-desc" className={`text-[14px] leading-5 text-(--lean-text-primary) ${clamped ? 'line-clamp-4' : ''}`}>
                  {DESCRIPTION}
                </p>
              </m.div>
              <SecondaryButton size="medium" aria-expanded={expanded} aria-controls="lean-program-desc" onClick={toggle}>
                {expanded ? 'Show less' : 'Show more'}
                <m.span className="flex size-6 items-center justify-center" animate={{ rotate: expanded ? 180 : 0 }}>
                  <Svg src="icon-chevron-down.svg" width={13.5} height={7.5} />
                </m.span>
              </SecondaryButton>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex h-10 overflow-hidden rounded-[4px] border border-(--lean-border-default)">
              <button
                type="button"
                aria-label="Previous week"
                disabled={week === 1}
                onClick={() => changeWeek(-1)}
                className={`flex min-h-10 items-center border-[0.3px] border-(--lean-border-default) bg-(--lean-bg-inputs) px-3 ${week === 1 ? 'text-(--lean-border-default)' : 'text-(--lean-text-secondary)'}`}
              >
                <MaskIcon src="icon-arrow-left.svg" width={20} height={20} />
              </button>
              <p aria-live="polite" className="flex flex-1 items-center justify-center bg-(--lean-bg-inputs) text-[18px] leading-7 font-bold text-(--lean-text-secondary)">
                Week {week}
              </p>
              <button
                type="button"
                aria-label="Next week"
                disabled={week === WEEKS}
                onClick={() => changeWeek(1)}
                className={`flex min-h-10 items-center border-[0.3px] border-(--lean-border-default) bg-(--lean-bg-inputs) px-3 ${week === WEEKS ? 'text-(--lean-border-default)' : 'text-(--lean-text-secondary)'}`}
              >
                <MaskIcon src="icon-arrow-right.svg" width={20} height={20} />
              </button>
            </div>
            <div className="relative overflow-hidden">
              <AnimatePresence initial={false} custom={weekDir} mode="popLayout">
                <m.div
                  key={week}
                  custom={weekDir}
                  variants={WEEK_SLIDE}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 300, damping: 34 }}
                  className="grid grid-cols-2 gap-2"
                >
                  {plan.map((w, i) => (
                    <WorkoutCard key={w.id} workout={w} day={(week - 1) * 7 + i + 1} completed={week === 1 && i === 0} />
                  ))}
                </m.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </Screen>
  )
}
