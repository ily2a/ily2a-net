'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, m, useIsPresent } from 'motion/react'
import { OptionButton, PrimaryButton, ProgressHeader, Title } from '../ui'
import WheelPicker from '../WheelPicker'

// Steps 1–9 are ONE screen. The header (back, progress bar, "N of 9") and
// the footer stay mounted; only the question in the middle swaps. That's
// what lets the bar grow and the number roll from step to step.

interface UnitOption { id: string; label: string; min: number; max: number; format?: (v: number) => string }

interface ChoiceQuestion {
  kind: 'choice'
  title: string
  subtitle?: ReactNode
  options: readonly string[]
  value: string
  onChange: (v: string) => void
  /** Footer CTA. Without one, tapping an option moves on by itself. */
  cta?: string
}

interface MeasureQuestion {
  kind: 'measure'
  title: string
  subtitle?: ReactNode
  value: number
  onChange: (v: number) => void
  units: readonly UnitOption[]
  unit: string
  onUnitChange?: (unit: string) => void
  /** Label beside the picker when there are no unit tabs (age). */
  suffix?: string
  cta: string
}

export type Question = ChoiceQuestion | MeasureQuestion

const SWAP = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 12 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -12 }),
}
const SWAP_TRANSITION = { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const }
const AUTO_ADVANCE_MS = 280

/** Content on its way out stays visible for the animation but can't be clicked or focused. */
function Live({ children }: { children: ReactNode }) {
  const present = useIsPresent()
  return <div inert={!present}>{children}</div>
}

/** Focus the new question's heading after a step change (keyboard users). */
function useHeadingFocus(enabled: boolean) {
  const ref = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (enabled) ref.current?.focus({ preventScroll: true })
  }, [enabled])
  return ref
}

function ChoiceBody({ q, onPicked, focus }: { q: ChoiceQuestion; onPicked: () => void; focus: boolean }) {
  const titleId = useId()
  const headingRef = useHeadingFocus(focus)
  return (
    <div className="flex flex-col gap-6">
      <Title id={titleId} headingRef={headingRef} title={q.title} subtitle={q.subtitle} />
      <div role="radiogroup" aria-labelledby={titleId} className="flex flex-col gap-4">
        {q.options.map(o => (
          <OptionButton key={o} selected={q.value === o} onClick={() => { q.onChange(o); onPicked() }}>
            {o}
          </OptionButton>
        ))}
      </div>
    </div>
  )
}

function MeasureBody({ q, focus }: { q: MeasureQuestion; focus: boolean }) {
  const headingRef = useHeadingFocus(focus)
  const current = q.units.find(u => u.id === q.unit) ?? q.units[0]!
  return (
    <div className="flex flex-col items-center gap-6">
      <Title headingRef={headingRef} title={q.title} subtitle={q.subtitle} />
      {q.units.length > 1 && q.onUnitChange && (
        <div role="radiogroup" aria-label="Unit" className="flex gap-4">
          {q.units.map(u => (
            <OptionButton key={u.id} selected={u.id === q.unit} onClick={() => q.onUnitChange?.(u.id)} className="w-[88px] px-0">
              {u.label}
            </OptionButton>
          ))}
        </div>
      )}
      <WheelPicker
        value={q.value}
        min={current.min}
        max={current.max}
        onChange={q.onChange}
        format={current.format}
        unit={q.suffix ?? current.label}
        label={q.title}
      />
    </div>
  )
}

interface QuestionnaireProps {
  questions: readonly Question[]
  /** Back from step 1 leaves the questionnaire. */
  onExit: () => void
  /** Called after the last step. */
  onDone: () => void
}

export function Questionnaire({ questions, onExit, onDone }: QuestionnaireProps) {
  const [step, setStep] = useState(1)
  const [dir, setDir] = useState(1)
  const [moved, setMoved] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => {
    const t = timer
    return () => clearTimeout(t.current)
  }, [])

  const total = questions.length
  const q = questions[step - 1]!

  // Plain (not functional) updates from this render's `step`: a stale
  // handler firing late lands on the same step instead of skipping one.
  const next = () => {
    clearTimeout(timer.current)
    if (step === total) { onDone(); return }
    setDir(1); setMoved(true); setStep(step + 1)
  }
  const back = () => {
    clearTimeout(timer.current)
    if (step === 1) { onExit(); return }
    setDir(-1); setMoved(true); setStep(step - 1)
  }
  // Let the selected state show for a beat before moving on.
  const picked = () => {
    if (q.cta) return
    clearTimeout(timer.current)
    timer.current = setTimeout(next, AUTO_ADVANCE_MS)
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-(--lean-bg-screen) pt-11">
      <div className="flex flex-1 flex-col gap-8 overflow-hidden px-4 pt-[19px] pb-5">
        <ProgressHeader step={step} total={total} dir={dir} onBack={back} />
        <div className="relative">
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <m.div key={step} custom={dir} variants={SWAP} initial="enter" animate="center" exit="exit" transition={SWAP_TRANSITION}>
              <Live>
                {q.kind === 'choice'
                  ? <ChoiceBody q={q} onPicked={picked} focus={moved} />
                  : <MeasureBody q={q} focus={moved} />}
              </Live>
            </m.div>
          </AnimatePresence>
        </div>
      </div>
      {/* Fixed-height footer so the CTA can come and go without moving anything. */}
      <div className="flex h-[108px] shrink-0 flex-col items-center px-4 pt-2">
        <AnimatePresence initial={false}>
          {q.cta && (
            <m.div
              key={q.cta}
              className="w-full"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={SWAP_TRANSITION}
            >
              {/* A choice step's CTA is Disabled until an option is picked. */}
              <Live><PrimaryButton onClick={next} disabled={q.kind === 'choice' && !q.value}>{q.cta}</PrimaryButton></Live>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
