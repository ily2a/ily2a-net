'use client'

import { useId } from 'react'
import Image from 'next/image'
import { AnimatePresence, m } from 'motion/react'
import { asset, Logo, MaskIcon, PrimaryButton, Screen, Svg, TextInput, Title } from '../ui'

// Name → "What is the LEAN Method?" → fitness level. These three sit
// before the numbered 1–9 questions, so they show the logo, not progress.

export function Name({ value, onChange, onNext }: { value: string; onChange: (v: string) => void; onNext: () => void }) {
  const id = useId()
  // DS Button primary "Disabled" until there's a name to continue with.
  const filled = value.trim() !== ''
  const next = () => { if (filled) onNext() }
  return (
    <Screen footer={<PrimaryButton onClick={next} disabled={!filled}>Next</PrimaryButton>}>
      <div className="flex flex-col gap-8">
        <div className="flex justify-center"><Logo /></div>
        <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); next() }}>
          <label htmlFor={id} className="text-[18px] leading-7 font-bold text-(--lean-text-secondary)">What’s your name?</label>
          <TextInput id={id} placeholder="Enter your full name" value={value} onChange={e => onChange(e.target.value)} autoComplete="off" />
        </form>
      </div>
    </Screen>
  )
}

export function Education({ onNext }: { onNext: () => void }) {
  return (
    <Screen footer={<PrimaryButton onClick={onNext}>Get started</PrimaryButton>}>
      <div className="flex flex-1 flex-col gap-8">
        <div className="flex justify-center"><Logo /></div>
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <Title title="What is the LEAN Method?" />
          <div className="flex flex-col gap-1.5 text-[14px] leading-5 text-(--lean-text-primary)">
            <p>No matter where you are in your fitness journey, the LEAN Method will change the way you train.</p>
            <p>Our structured, science-based programs are expertly designed to make every session count. The signature blend of at-home Strength training, Pilates, and Cardio delivers the perfect balance of energy, challenge, and progression—so you can achieve results that truly last.</p>
            <p>This is more than a workout program—it’s a holistic approach that builds strength from the inside out. Physically powerful, mindset regulating and emotionally uplifting—And the best part? You’ll want to keep going.</p>
          </div>
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <Image src={asset('education.png')} alt="Lilly introducing the LEAN Method" fill sizes="343px" className="object-cover object-[50%_20%]" />
            <Svg src="icon-play.svg" width={40} height={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>
    </Screen>
  )
}

export type Level = 'beginner' | 'intermediate' | 'advanced'

const LEVELS: { id: Level; label: string; icon: string; iconSize: [number, number]; iconInset: string; desc: string }[] = [
  { id: 'beginner', label: 'Beginner', icon: 'signal-low.svg', iconSize: [19.75, 6.75], iconInset: 'mt-[13.25px] ml-[2.25px]', desc: 'Starting fitness or returning after a break, building confidence and learning basics.' },
  { id: 'intermediate', label: 'Intermediate', icon: 'signal-medium.svg', iconSize: [19.75, 10.75], iconInset: 'mt-[9.25px] ml-[2.25px]', desc: 'You’ve been active for a while. You feel ready to increase intensity or variety in your workouts.' },
  { id: 'advanced', label: 'Advanced', icon: 'signal-full.svg', iconSize: [19.5, 14.5], iconInset: 'mt-[5.25px] ml-[2.25px]', desc: 'You train often and push yourself. You’re confident with technique and looking for progress.' },
]

export function FitnessLevel({ value, onChange, onNext }: { value: Level; onChange: (l: Level) => void; onNext: () => void }) {
  const titleId = useId()
  return (
    <Screen footer={<PrimaryButton onClick={onNext}>Next</PrimaryButton>}>
      <div className="flex flex-col gap-8">
        <div className="flex justify-center"><Logo /></div>
        <div className="flex flex-col gap-6">
          {/* The Figma subtitle here is placeholder copy ("Write correct copy"). */}
          <Title id={titleId} title="What’s your fitness level?" subtitle="We’ll match you with the right program." />
          <div role="radiogroup" aria-labelledby={titleId} className="flex flex-col gap-4">
            {LEVELS.map(l => {
              const selected = value === l.id
              return (
                <button
                  key={l.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onChange(l.id)}
                  className="lean-shadow flex w-full flex-col overflow-hidden rounded-[2px] text-left"
                >
                  {/* Only the Beginner card has artwork in the file. */}
                  <AnimatePresence initial={false}>
                    {selected && l.id === 'beginner' && (
                      <m.div
                        key="art"
                        className="relative w-full overflow-hidden"
                        initial={{ height: 0 }}
                        animate={{ height: 137.2 }}
                        exit={{ height: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 34 }}
                      >
                        <Image src={asset('level-beginner.png')} alt="" fill sizes="343px" className="object-cover" />
                      </m.div>
                    )}
                  </AnimatePresence>
                  <span
                    className={`flex flex-col gap-1.5 px-4 py-3 transition-colors duration-150 ${
                      selected
                        ? `bg-(--lean-card-bg-2) border-(--lean-border-muted) ${l.id === 'beginner' ? 'border-x border-b' : 'border'}`
                        : 'min-h-[92px] border-[0.5px] border-(--lean-border-default) bg-(--lean-card-bg)'
                    }`}
                  >
                    <span className={`flex items-center gap-2 ${selected ? 'text-(--lean-text-secondary)' : 'text-(--lean-text-muted)'}`}>
                      <span className="text-[16px] leading-6 font-bold">{l.label}</span>
                      <span className="block size-6 shrink-0">
                        <span className={`block ${l.iconInset}`}>
                          <MaskIcon src={l.icon} width={l.iconSize[0]} height={l.iconSize[1]} />
                        </span>
                      </span>
                    </span>
                    <span className={`text-[12px] leading-[18px] ${selected ? 'text-(--lean-text-primary)' : 'text-(--lean-text-muted)'}`}>{l.desc}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </Screen>
  )
}
