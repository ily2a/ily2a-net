'use client'

import Image from 'next/image'
import { AnimatePresence, m, type HTMLMotionProps } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import { sumMacros, type Dish, type Macros, type MealType } from './data'

// Shared BARE building blocks. Values come straight from the Figma
// components: Buttons, Checkbox, Nutrition Info, Meal Card, Tab bar.

export const asset = (file: string) => `/demos/bare/${file}`

const PRESS = { scale: 0.98 }

/** Plain decorative SVG asset at its native size. */
export function Svg({ src, width, height, className = '' }: { src: string; width: number; height: number; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- tiny local SVGs; next/image adds nothing here
  return <img src={asset(src)} alt="" aria-hidden width={width} height={height} className={`block shrink-0 ${className}`} />
}

/** A fixed-colour SVG from the file, recoloured with currentColor via a CSS mask. */
export function MaskIcon({ src, width, height, className = '' }: { src: string; width: number; height: number; className?: string }) {
  const style: CSSProperties = {
    width, height,
    maskImage: `url(${asset(src)})`, WebkitMaskImage: `url(${asset(src)})`,
    maskSize: '100% 100%', WebkitMaskSize: '100% 100%',
  }
  return <span aria-hidden className={`block shrink-0 bg-current ${className}`} style={style} />
}

export function StatusBar() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-20 h-11">
      <Svg src="status-time.svg" width={54} height={21} className="absolute top-3 left-[21px]" />
      <Svg src="status-right.svg" width={66.661} height={11.336} className="absolute top-[17.33px] right-[14.67px]" />
    </div>
  )
}

/**
 * The Planner tab bar and home indicator. The other tabs aren't part of
 * this demo, so the bar is decoration: it shows where you are, nothing more.
 */
export function TabBar() {
  return (
    <div aria-hidden className="flex w-full flex-col">
      <div className="flex items-center justify-between bg-(--bare-nav-bg) px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="flex size-8 items-center justify-center rounded-[8px] bg-(--bare-nav-icon-wrapper)">
            <Svg src="icon-calendar.svg" width={21} height={22} />
          </span>
          <span className="text-[12px] leading-[18px] font-medium text-(--bare-text-brand)">Planner</span>
        </div>
        <span className="flex w-12 justify-center"><Svg src="icon-restaurant.svg" width={21.5} height={19.5} className="-scale-y-100" /></span>
        <span className="flex w-12 justify-center"><Svg src="icon-book.svg" width={21.5} height={20.5} /></span>
        <span className="flex w-12 justify-center">
          <Image src={asset('avatar-tab.webp')} alt="" width={20} height={20} className="rounded-full" />
        </span>
      </div>
      <HomeIndicator />
    </div>
  )
}

export function HomeIndicator() {
  return (
    <div aria-hidden className="flex h-10 items-end justify-center pb-2">
      <div className="h-[5px] w-[134px] rounded-full bg-(--bare-button-primary)" />
    </div>
  )
}

type ButtonProps = HTMLMotionProps<'button'> & { children: ReactNode }

/** DS "Buttons", primary, size L, and disabled (grey fill, muted label). */
export function PrimaryButton({ children, className = '', type = 'button', disabled, ...rest }: ButtonProps) {
  return (
    <m.button
      type={type}
      disabled={disabled}
      whileTap={disabled ? undefined : PRESS}
      className={`bare-shadow-skeu flex h-12 w-full items-center justify-center gap-2.5 rounded-[8px] px-6 text-[16px] leading-6 font-semibold transition-colors duration-150 ${
        disabled ? 'bg-(--bare-button-disabled) text-(--bare-text-muted)' : 'bg-(--bare-button-primary) text-(--bare-text-inverse)'
      } ${className}`}
      {...rest}
    >
      {children}
    </m.button>
  )
}

/** DS "Buttons", Terciary, size S: mint fill, brand label, optional icon. */
export function TerciaryButton({ children, className = '', type = 'button', ...rest }: ButtonProps) {
  return (
    <m.button
      type={type}
      whileTap={PRESS}
      className={`bare-shadow-skeu flex h-10 items-center justify-center gap-2.5 rounded-[8px] bg-(--bare-button-terciary) p-3 text-[16px] leading-6 font-semibold text-(--bare-text-brand) ${className}`}
      {...rest}
    >
      {children}
    </m.button>
  )
}

/** The plain text "Tab" links in the shopping list header (Select all days, …). */
export function TextTab({ children, className = '', ...rest }: ButtonProps) {
  return (
    <m.button
      type="button"
      whileTap={PRESS}
      className={`flex h-8 shrink-0 items-center justify-center rounded-[10px] px-3 text-[12px] leading-[18px] font-semibold text-(--bare-text-brand) ${className}`}
      {...rest}
    >
      {children}
    </m.button>
  )
}

export type CheckState = 'checked' | 'unchecked' | 'indeterminate'

/**
 * DS "Checkbox", size sm, with its three states: Unchecked (grey outline),
 * Checked (mint fill, brand tick) and Indeterminate (darker mint, minus).
 */
export function Checkbox({ state, label, onToggle, className = '' }: { state: CheckState; label: string; onToggle: () => void; className?: string }) {
  return (
    <m.button
      type="button"
      role="checkbox"
      aria-checked={state === 'indeterminate' ? 'mixed' : state === 'checked'}
      aria-label={label}
      onClick={onToggle}
      whileTap={{ scale: 0.9 }}
      // 44px hit area around the 20px box, without moving the layout.
      className={`relative -m-3 flex size-11 shrink-0 items-center justify-center ${className}`}
    >
      <span
        aria-hidden
        className={`relative flex size-5 items-center justify-center rounded-[6px] transition-colors duration-150 ${
          state === 'checked' ? 'bg-(--bare-button-terciary)'
            : state === 'indeterminate' ? 'bg-(--bare-tag-terciary)'
              : 'border border-(--bare-border-subtle) bg-(--bare-bg-surface)'
        }`}
      >
        {state !== 'unchecked' && (
          <m.span key={state} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 600, damping: 30 }}>
            <Svg src={state === 'checked' ? 'icon-check.svg' : 'icon-minus.svg'} width={15} height={15} />
          </m.span>
        )}
      </span>
    </m.button>
  )
}

const MACRO_TAGS = [
  { key: 'p', icon: 'tag-protein.svg', tone: 'bg-(--bare-prot-bg) text-(--bare-prot-fg)', suffix: 'g' },
  { key: 'c', icon: 'tag-carbs.svg', tone: 'bg-(--bare-carbs-bg) text-(--bare-carbs-fg)', suffix: 'g' },
  { key: 'f', icon: 'tag-fat.svg', tone: 'bg-(--bare-fat-bg) text-(--bare-fat-fg)', suffix: 'g' },
  { key: 'kcal', icon: 'tag-kcal.svg', tone: 'bg-(--bare-kcal-bg) text-(--bare-kcal-fg)', suffix: ' kcal' },
] as const

/** The four macro pills under a meal: P, C, F, kcal. Read out as one sentence. */
export function MacroTags({ macros }: { macros: Macros }) {
  const text = `${macros.p}g protein, ${macros.c}g carbs, ${macros.f}g fat, ${macros.kcal} kcal`
  return (
    <div className="flex items-center gap-1" role="img" aria-label={text}>
      {MACRO_TAGS.map(t => (
        <span key={t.key} className={`flex items-center gap-1 rounded-full py-1 pr-1.5 pl-1 text-[12px] leading-[18px] whitespace-nowrap ${t.tone}`}>
          <Svg src={t.icon} width={20} height={20} />
          {macros[t.key]}{t.suffix}
        </span>
      ))}
    </div>
  )
}

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const ROLL = { type: 'spring', stiffness: 260, damping: 28 } as const

// A whole-pixel line, so every reel stops on the same pixel row
// (the design's 16.74px leaves each digit a fraction off).
const LINE = 17

/** One digit as a 0–9 reel that rolls to its value. */
function Digit({ value }: { value: number }) {
  return (
    <span className="relative block overflow-hidden" style={{ height: LINE }}>
      <m.span
        className="flex flex-col"
        initial={false}
        animate={{ y: -value * LINE }}
        transition={ROLL}
      >
        {DIGITS.map(d => <span key={d} className="block" style={{ height: LINE, lineHeight: `${LINE}px` }}>{d}</span>)}
      </m.span>
    </span>
  )
}

/**
 * An odometer: each digit rolls up or down to the new number, so digits
 * that don't change stay still. A digit that comes or goes (72 → 104)
 * fades in or out at the front. Screen readers get the plain number.
 */
export function SlidingNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const digits = String(value).split('')
  return (
    <span className="inline-flex tabular-nums" style={{ lineHeight: `${LINE}px` }}>
      <span className="sr-only">{value}{suffix}</span>
      <span aria-hidden className="inline-flex items-start">
        <AnimatePresence initial={false} mode="popLayout">
          {digits.map((d, i) => (
            // Keyed by place value (ones, tens, …) so each reel keeps its position.
            <m.span
              // eslint-disable-next-line react/no-array-index-key -- the place value is the identity here
              key={digits.length - i}
              initial={{ opacity: 0, y: '-40%' }}
              animate={{ opacity: 1, y: '0%' }}
              exit={{ opacity: 0, y: '40%' }}
              transition={ROLL}
              className="inline-flex"
            >
              <Digit value={Number(d)} />
            </m.span>
          ))}
        </AnimatePresence>
        {suffix && <span className="whitespace-pre">{suffix}</span>}
      </span>
    </span>
  )
}

/**
 * DS "Nutrition Info": the day's targets in four cells. Calories and
 * protein are the same every day; carbs and fat roll to the new day's
 * numbers like an odometer.
 */
export function DayTargets({ macros }: { macros: Macros }) {
  const cells = [
    { label: 'Kcal', value: macros.kcal, suffix: '', tone: 'bg-(--bare-kcal-bg) text-(--bare-kcal-fg)' },
    { label: 'Protein', value: macros.p, suffix: ' g', tone: 'bg-(--bare-prot-bg) text-(--bare-prot-fg)' },
    { label: 'Carbs', value: macros.c, suffix: ' g', tone: 'bg-(--bare-carbs-bg) text-(--bare-carbs-fg)' },
    { label: 'Fat', value: macros.f, suffix: ' g', tone: 'bg-(--bare-fat-bg) text-(--bare-fat-fg)' },
  ]
  return (
    <dl className="flex h-12 w-full gap-[3.72px]">
      {cells.map(c => (
        <div key={c.label} className={`flex flex-1 flex-col items-center justify-center rounded-[7.44px] py-[3.72px] pr-[5.58px] pl-[3.72px] whitespace-nowrap ${c.tone}`}>
          <dt className="text-[13px] leading-[18.6px]">{c.label}</dt>
          <dd className="text-[11.16px] font-semibold">
            <SlidingNumber value={c.value} suffix={c.suffix} />
          </dd>
        </div>
      ))}
    </dl>
  )
}

const MEAL_ICON: Record<MealType, { src: string; width: number; height: number }> = {
  breakfast: { src: 'icon-breakfast.svg', width: 20, height: 20 },
  main: { src: 'icon-taco.svg', width: 17.92, height: 14.58 },
  snack: { src: 'icon-taco.svg', width: 17.92, height: 14.58 },
}

export function MealIcon({ type }: { type: MealType }) {
  const icon = MEAL_ICON[type]
  return (
    <span className="flex size-5 shrink-0 items-center justify-center">
      <Svg src={icon.src} width={icon.width} height={icon.height} />
    </span>
  )
}

/** A dish inside a Meal Card: photo, name, macros, and an optional checkbox. */
function DishRow({ dish: d, action }: { dish: Dish; action?: ReactNode }) {
  return (
    <>
      <Image src={asset(d.img)} alt="" width={54} height={54} className="size-[54px] shrink-0 rounded-[10px] object-cover" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[14px] leading-5 font-medium">{d.name}</p>
          {action}
        </div>
        <MacroTags macros={d.macros} />
      </div>
    </>
  )
}

/**
 * DS "Meal Card": the meal's title, its total macros when it has more than
 * one dish, then each dish. `headerAction` and `dishAction` are the picker's
 * checkboxes; on the Planner they're empty.
 */
export function MealCard({ type, label, dishes, headerAction, dishAction, onOpen }: {
  type: MealType
  label: string
  dishes: Dish[]
  headerAction?: ReactNode
  dishAction?: (index: number) => ReactNode
  /** On the Planner, tapping a dish opens its meal screen. */
  onOpen?: (dish: Dish) => void
}) {
  const several = dishes.length > 1
  return (
    <article className="bare-shadow-card flex w-full flex-col gap-3 rounded-[10px] bg-(--bare-bg-surface) px-2 py-3">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MealIcon type={type} />
          <h3 className="text-[16px] leading-6 font-semibold">{label}</h3>
        </div>
        {headerAction}
      </header>
      {several && <MacroTags macros={sumMacros(dishes)} />}
      <div className="flex flex-col gap-3">
        {dishes.map((d, i) => (
          <div key={d.id} className={several && i === 0 ? 'border-t border-(--bare-border-default) pt-3' : ''}>
            {onOpen ? (
              <m.button
                type="button"
                onClick={() => onOpen(d)}
                aria-label={`${d.name}, open recipe`}
                whileTap={PRESS}
                className="flex w-full items-center gap-2 rounded-[10px] text-left"
              >
                <DishRow dish={d} />
              </m.button>
            ) : (
              <div className="flex items-center gap-2">
                <DishRow dish={d} action={dishAction?.(i)} />
              </div>
            )}
          </div>
        ))}
      </div>
    </article>
  )
}
