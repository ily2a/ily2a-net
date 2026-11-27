'use client'

import { useCallback, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { Public_Sans } from 'next/font/google'
import './tokens.css'
import { HomeIndicator, StatusBar } from './ui'
import { Splash, Welcome } from './screens/Intro'
import { Login, Signup } from './screens/Auth'
import { Paywall } from './screens/Paywall'
import { Education, FitnessLevel, Name, type Level } from './screens/Profile'
import { Questionnaire, type Question } from './screens/Questions'
import { Program } from './screens/Program'

// Lean onboarding, coded from the Figma file's "Onboarding // signup //
// Paywall" section. The flow is:
//
//   Splash → Welcome ─ Sign up → Create account → Paywall ──┐
//                    └ Login   → Login          → Paywall sale ┤
//   Name → LEAN Method → Fitness level → Questions 1–9 → Recommended program
//
// Each of those is a screen that slides in, except Questions 1–9: that's
// one screen whose progress bar and step counter move while the question
// swaps in place. "Start now" on the last screen loops back to the splash.

const publicSans = Public_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap' })

type ScreenId =
  | 'splash' | 'welcome' | 'login' | 'signup' | 'paywall' | 'paywallSale'
  | 'name' | 'education' | 'level' | 'questions' | 'program'

const DAYS = ['3 days', '4 days', '5 days', '6 days'] as const
const GENDERS = ['Female', 'Male'] as const
const GOALS = ['Lose weight', 'Get fitter', 'Build muscle'] as const
const ACTIVITY = ['Little to no movement', 'Mostly seated', 'Some movement', 'Regular light exercise', 'Intense daily activity'] as const
const DIETS = ['Standard', 'Pescatarian', 'Vegetarian', 'Vegan'] as const
const MEALS = ['3 meals', '3 meals & 1 snack', '3 meals & 2 snacks', '3 meals & 3 snacks'] as const

const AGE_UNITS = [{ id: 'years', label: 'Years', min: 16, max: 90 }] as const
const WEIGHT_UNITS = [
  { id: 'kg', label: 'Kg', min: 35, max: 200 },
  { id: 'lbs', label: 'Lbs', min: 77, max: 440 },
] as const
const HEIGHT_UNITS = [
  { id: 'cm', label: 'Cm', min: 130, max: 220 },
  { id: 'ft', label: 'Ft', min: 51, max: 87, format: (inches: number) => `${Math.floor(inches / 12)}′${inches % 12}` },
] as const

const KG_PER_LB = 0.45359237
const CM_PER_IN = 2.54

interface Answers {
  name: string
  level: Level
  days: string
  gender: string
  age: number
  weight: number
  weightUnit: string
  height: number
  heightUnit: string
  goal: string
  activity: string
  diet: string
  meals: string
}

// Choice steps start with nothing picked (all options in their Default
// state); the pickers start on the values shown in the Figma frames.
const INITIAL: Answers = {
  name: '',
  level: 'beginner',
  days: '',
  gender: '',
  age: 25,
  weight: 78, weightUnit: 'kg',
  height: 181, heightUnit: 'cm',
  goal: '',
  activity: '',
  diet: '',
  meals: '',
}

const slide = {
  enter: (dir: number) => ({ x: dir * 48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -48, opacity: 0 }),
}

export default function LeanOnboarding() {
  const [history, setHistory] = useState<ScreenId[]>(['splash'])
  const [dir, setDir] = useState(1)
  const [a, setA] = useState(INITIAL)
  const screen = history[history.length - 1]!

  const go = useCallback((to: ScreenId) => { setDir(1); setHistory(h => [...h, to]) }, [])
  const swap = useCallback((to: ScreenId) => { setDir(1); setHistory(h => [...h.slice(0, -1), to]) }, [])
  const back = useCallback(() => { setDir(-1); setHistory(h => (h.length > 1 ? h.slice(0, -1) : h)) }, [])
  const restart = useCallback(() => { setDir(1); setA(INITIAL); setHistory(['splash']) }, [])
  const toWelcome = useCallback(() => swap('welcome'), [swap])
  const set = <K extends keyof Answers>(key: K) => (value: Answers[K]) => setA(s => ({ ...s, [key]: value }))

  const setWeightUnit = (unit: string) => setA(s => s.weightUnit === unit ? s : {
    ...s, weightUnit: unit,
    weight: Math.round(unit === 'lbs' ? s.weight / KG_PER_LB : s.weight * KG_PER_LB),
  })
  const setHeightUnit = (unit: string) => setA(s => s.heightUnit === unit ? s : {
    ...s, heightUnit: unit,
    height: Math.round(unit === 'ft' ? s.height / CM_PER_IN : s.height * CM_PER_IN),
  })

  const questions: Question[] = [
    { kind: 'choice', title: 'How many times per week do you want to workout?', subtitle: 'This will help us personalise your program.',
      options: DAYS, value: a.days, onChange: set('days') },
    { kind: 'choice', title: 'What is your gender?', subtitle: 'We use this info to create you personalised meal plan.',
      options: GENDERS, value: a.gender, onChange: set('gender') },
    { kind: 'measure', title: 'Tell us your age', cta: 'Next',
      subtitle: <>
        <p className="mb-4">To help us calculate your target calories in your personalised meal plan.</p>
        <p>Note, you have the option to hide your calories from your profile</p>
      </>,
      value: a.age, onChange: set('age'), units: AGE_UNITS, unit: 'years', suffix: 'Years old' },
    { kind: 'measure', title: 'What is your current weight?', cta: 'Next',
      value: a.weight, onChange: set('weight'), units: WEIGHT_UNITS, unit: a.weightUnit, onUnitChange: setWeightUnit },
    { kind: 'measure', title: 'What is your height?', cta: 'Next',
      value: a.height, onChange: set('height'), units: HEIGHT_UNITS, unit: a.heightUnit, onUnitChange: setHeightUnit },
    { kind: 'choice', title: 'What is your goal?', subtitle: 'This will help us tailor the amount of calories per day you need.',
      options: GOALS, value: a.goal, onChange: set('goal') },
    { kind: 'choice', title: 'How active are you on a typical day?', subtitle: 'This will help us to tailor your personalised meal plan',
      options: ACTIVITY, value: a.activity, onChange: set('activity') },
    { kind: 'choice', title: 'What is your diet type?',
      options: DIETS, value: a.diet, onChange: set('diet') },
    { kind: 'choice', title: 'How many meals a day would you like?', subtitle: 'Don’t worry, you can change it later', cta: 'Let’s go',
      options: MEALS, value: a.meals, onChange: set('meals') },
  ]

  const render = () => {
    switch (screen) {
      case 'splash': return <Splash onDone={toWelcome} />
      case 'welcome': return <Welcome onSignup={() => go('signup')} onLogin={() => go('login')} />
      case 'signup': return <Signup onSubmit={() => go('paywall')} onLogin={() => swap('login')} />
      case 'login': return <Login onSubmit={() => go('paywallSale')} onSignup={() => swap('signup')} />
      case 'paywall': return <Paywall onContinue={() => go('name')} />
      case 'paywallSale': return <Paywall sale onContinue={() => go('name')} />
      case 'name': return <Name value={a.name} onChange={set('name')} onNext={() => go('education')} />
      case 'education': return <Education onNext={() => go('level')} />
      case 'level': return <FitnessLevel value={a.level} onChange={set('level')} onNext={() => go('questions')} />
      case 'questions': return <Questionnaire questions={questions} onExit={back} onDone={() => go('program')} />
      case 'program': return <Program onStart={restart} />
    }
  }

  return (
    <div className={`lean demo-scope ${publicSans.className} absolute inset-0 overflow-hidden`}>
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <m.section
          key={history.length + screen}
          aria-label="Lean app screen"
          className="absolute inset-0"
          custom={dir}
          variants={slide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        >
          {render()}
        </m.section>
      </AnimatePresence>
      <StatusBar />
      <HomeIndicator />
    </div>
  )
}
