'use client'

import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react'
import { AnimatePresence, m, useMotionValue } from 'motion/react'
import {
  ApplePayLogo, CardIcon, CauseIcon, CharityLogo, GlobalSearchIcon, GooglePayLogo, MaskSvg, mfAsset,
  PayPalLogo, SplitIcon, Svg,
} from './assets'
import { CAUSES, SPLIT_CAUSES } from './data'
import { money, moneyShort, type Checkout, type GiveTime, type PayMethod } from './checkout'
import { RollingText, type DonationTarget } from './landing'
import { useCanHover } from '../device'

// Payment's controls in the file's light style (Payment, the receipt).
// Each reads its colours from the .mf-light variables.

const SPRING = { type: 'spring', stiffness: 420, damping: 36 } as const

// ── Layout ───────────────────────────────────────────────────────────

/** The white cards Payment is built from. */
export function Panel({ className = '', labelledBy, dense = false, children }: { className?: string; labelledBy?: string; dense?: boolean; children: ReactNode }) {
  // 20px padding on web, 16px on the phone (less the 1px border the file draws inside).
  return (
    <section aria-labelledby={labelledBy} className={`mf-card-shadow flex flex-col gap-5 rounded-lg border border-(--mf-border) bg-(--mf-bg-primary) ${dense ? 'p-[15px]' : 'p-[19px]'} ${className}`}>
      {children}
    </section>
  )
}

/** A card's title and its line of explanation. */
export function PanelHead({ id, title, children }: { id: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 text-(--mf-text)">
      <h3 id={id} className="mf-trim text-[20px] leading-[1.3] font-semibold tracking-[0.04px]">{title}</h3>
      {children && <p className="mf-trim mf-ff text-[18px] leading-[1.45]">{children}</p>}
    </div>
  )
}

export function BackLink({ onClick }: { onClick: () => void }) {
  const canHover = useCanHover()
  return (
    <m.button type="button" onClick={onClick} whileHover={canHover ? 'hover' : undefined} className="flex shrink-0 items-center gap-2 rounded-md">
      <m.span className="flex" variants={{ hover: { x: -2 } }} transition={SPRING}>
        <Svg src="back-arrow.svg" width={24} height={24} />
      </m.span>
      <span className="mf-trim text-[20px] leading-[30px] font-medium tracking-[0.04px] text-(--mf-text)">Back</span>
    </m.button>
  )
}

/** The cause or charity in the heading: its icon and name, or a charity's own lockup. */
export function TargetChip({ target }: { target: DonationTarget }) {
  if (target.kind === 'charity' && target.charity.id === 'gosh') {
    // The file draws Great Ormond Street's full logo here, shadow included.
    return (
      <span role="img" aria-label={target.charity.name} className="relative block h-[71px] w-[259px] shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element -- local SVG */}
        <img src={mfAsset('gosh-chip.svg')} alt="" width={263} height={75} className="absolute top-[-1px] left-[-2px] block max-w-none" />
      </span>
    )
  }
  return (
    <span className="mf-card-shadow flex shrink-0 items-center gap-4 rounded-lg border border-(--mf-border) bg-(--mf-bg-primary) px-[19px] py-[11px]">
      {target.kind === 'cause' ? <CauseIcon name={target.cause.id} size={40} /> : <CharityLogo logo={target.charity.logo} size={40} />}
      <span className="mf-trim text-center text-[24px] leading-[1.3] font-semibold tracking-[0.048px] whitespace-nowrap text-(--mf-text)">
        {target.kind === 'cause' ? target.cause.name : target.charity.name}
      </span>
    </span>
  )
}

// ── Buttons ──────────────────────────────────────────────────────────

const BUTTON = 'mf-skeuo flex h-10 shrink-0 items-center justify-center rounded-lg py-2.5 text-[16px] leading-[1.3] font-semibold tracking-[0.032px] whitespace-nowrap transition-colors'

export function SecondaryButton({ onClick, children, className = '' }: { onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <m.button type="button" onClick={onClick} whileTap={{ scale: 0.98 }}
      className={`${BUTTON} border border-(--mf-border) px-[39px] bg-(--mf-bg-primary) text-(--mf-text-secondary) demo-hover:bg-(--mf-bg-secondary) ${className}`}>
      <span className="mf-trim px-0.5">{children}</span>
    </m.button>
  )
}

interface PrimaryButtonProps {
  onClick: () => void
  children: ReactNode
  /** Looks disabled, but still answers a click by showing what's missing. */
  incomplete?: boolean
  busy?: boolean
  className?: string
}

export function PrimaryButton({ onClick, children, incomplete = false, busy = false, className = '' }: PrimaryButtonProps) {
  return (
    <m.button type="button" onClick={busy ? undefined : onClick} whileTap={incomplete || busy ? undefined : { scale: 0.98 }}
      aria-disabled={incomplete || undefined} aria-busy={busy || undefined}
      className={`${BUTTON} relative border-2 border-white/12 bg-(--mf-gray-800) ${className || 'px-[38px]'} text-(--mf-white) ${incomplete ? 'opacity-50' : 'demo-hover:bg-(--mf-gray-900)'}`}>
      <span className={`mf-trim px-0.5 ${busy ? 'invisible' : ''}`}>{children}</span>
      {busy && (
        <m.span aria-hidden className="absolute size-4 rounded-full border-2 border-white/30 border-t-white"
          animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: 'linear', duration: 0.8 }} />
      )}
    </m.button>
  )
}

// ── Fields ───────────────────────────────────────────────────────────

/** The red line under a field that needs fixing. */
export function Hint({ id, error }: { id: string; error?: string }) {
  return (
    <AnimatePresence initial={false}>
      {error && (
        <m.p key="hint" id={id} className="mf-ff-body overflow-hidden text-[14px] leading-5 text-(--mf-error-600)"
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}>
          <span className="block pt-1.5">{error}</span>
        </m.p>
      )}
    </AnimatePresence>
  )
}

/** The input box: border goes dark when focused, red when it needs fixing. */
const box = (error?: string) =>
  `mf-field flex items-center rounded-lg border bg-(--mf-bg-primary) px-[13px] transition-colors ${
    error ? 'border-(--mf-error-300)' : 'border-(--mf-border) focus-within:border-(--mf-text-secondary)'
  }`

const INPUT = 'mf-ff-body min-w-0 flex-1 bg-transparent text-[16px] leading-[1.45] text-ellipsis text-(--mf-text) outline-none'
const LABEL = 'mf-trim mf-ff text-[16px] leading-[1.45] font-medium whitespace-nowrap text-(--mf-text)'

interface TextFieldProps {
  id: string
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  error?: string
  inputMode?: 'text' | 'numeric' | 'tel'
  /** Sets the width. */
  className?: string
}

export function TextField({ id, label, placeholder, value, onChange, onBlur, error, inputMode = 'text', className = '' }: TextFieldProps) {
  const hintId = `${id}-hint`
  return (
    <div className={`flex min-w-0 flex-col gap-2 ${className}`}>
      <label htmlFor={id} className={LABEL}>{label}</label>
      <div className="flex flex-col">
        <div data-invalid={error ? '' : undefined} className={`${box(error)} h-11`}>
          {/* A demo: nothing typed here leaves the page, and the browser shouldn't offer saved cards. */}
          <input id={id} value={value} placeholder={placeholder} inputMode={inputMode} autoComplete="off" spellCheck={false}
            onChange={e => onChange(e.target.value)} onBlur={onBlur}
            aria-invalid={error ? true : undefined} aria-describedby={error ? hintId : undefined}
            className={INPUT} />
        </div>
        <Hint id={hintId} error={error} />
      </div>
    </div>
  )
}

interface CityAutocompleteProps {
  id: string
  label: string
  cities: readonly string[]
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  error?: string
  /** Sets the width. */
  className?: string
}

/**
 * The billing city: a city search like "Where do you live", but with no
 * list to drop, since the form has no room for one. It completes as you
 * type ("Man" → "Manchester", the rest selected): Enter, Tab or → keeps
 * it, Escape or Backspace drops it. The X clears the field.
 */
export function CityAutocomplete({ id, label, cities, value, onChange, onBlur, error, className = '' }: CityAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const hintId = `${id}-hint`
  const canonical = (text: string) => cities.find(c => c.toLowerCase() === text.trim().toLowerCase())

  const onType = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target
    const typed = input.value
    const deleting = (e.nativeEvent as InputEvent).inputType?.startsWith('delete')
    const match = !deleting && typed.trim() && input.selectionStart === typed.length
      ? cities.find(c => c.length > typed.length && c.toLowerCase().startsWith(typed.toLowerCase()))
      : undefined
    if (!match) return onChange(typed)
    // Fill in the rest and select it, here rather than after React renders:
    // typing the next letter of the suggestion leaves the value unchanged,
    // so a later effect wouldn't run.
    const completed = typed + match.slice(typed.length)
    input.value = completed
    input.setSelectionRange(typed.length, completed.length)
    onChange(completed)
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const start = input.selectionStart ?? 0
    const suggesting = start < (input.selectionEnd ?? 0) && input.selectionEnd === input.value.length
    if (!suggesting) return
    if (e.key === 'Enter') {
      e.preventDefault()
      onChange(canonical(input.value) ?? input.value)
      input.setSelectionRange(input.value.length, input.value.length)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onChange(input.value.slice(0, start))
    }
  }

  return (
    <div className={`flex min-w-0 flex-col gap-2 ${className}`}>
      <label htmlFor={id} className={LABEL}>{label}</label>
      <div className="flex flex-col">
        <div data-invalid={error ? '' : undefined} className={`${box(error)} h-11`}>
          {/* The search icon makes way for the X once there's a city: on web the field is 160px and the name needs the room. */}
          <m.span aria-hidden className="flex shrink-0 overflow-hidden" initial={false}
            animate={{ width: value ? 0 : 28, opacity: value ? 0 : 1 }} transition={{ duration: 0.15 }}>
            <GlobalSearchIcon />
          </m.span>
          <input ref={inputRef} id={id} value={value} placeholder="Enter the name of your city" autoComplete="off" spellCheck={false}
            aria-autocomplete="inline" aria-invalid={error ? true : undefined} aria-describedby={error ? hintId : undefined}
            onChange={onType} onKeyDown={onKey}
            onBlur={e => {
              // Whatever's in the field stays; a city typed in lower case gets its capitals.
              const exact = canonical(e.target.value)
              if (exact && exact !== e.target.value) onChange(exact)
              onBlur()
            }}
            className={`${INPUT} selection:bg-(--mf-bg-tertiary) selection:text-(--mf-text-placeholder)`} />
          {/* The file's cancel-square, as on the landing's search, recoloured to the field's icons. */}
          <AnimatePresence initial={false}>
            {value && (
              <m.button key="clear" type="button" aria-label={`Clear ${label.toLowerCase()}`}
                onMouseDown={e => e.preventDefault()} onClick={() => { onChange(''); inputRef.current?.focus({ preventScroll: true }) }}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }}
                className="ml-2 flex size-5 shrink-0 items-center justify-center rounded-md text-(--mf-fg-quaternary) transition-colors demo-hover:text-(--mf-text)">
                <MaskSvg src="cancel-square.svg" width={17.08} height={17.08} />
              </m.button>
            )}
          </AnimatePresence>
        </div>
        <Hint id={hintId} error={error} />
      </div>
    </div>
  )
}

/** A label for a control that names itself (the billing Country dropdown). */
export function FieldLabel({ children }: { children: ReactNode }) {
  return <span aria-hidden className={LABEL}>{children}</span>
}

interface CityFieldProps {
  id: string
  cities: readonly string[]
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  error?: string
  labelledBy: string
}

/** "Enter the name of your city": type freely, or pick one of the suggestions. */
export function CityField({ id, cities, value, onChange, onBlur, error, labelledBy }: CityFieldProps) {
  const canHover = useCanHover()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listId = `${id}-list`
  const hintId = `${id}-hint`
  const needle = value.trim().toLowerCase()
  const matches = cities.filter(c => !needle || c.toLowerCase().includes(needle))
  // Once what's typed is a suggestion, there's nothing left to suggest.
  const shown = open && matches.length > 0 && !(matches.length === 1 && matches[0]!.toLowerCase() === needle)

  // Keep the highlighted city in view inside the list (not the page).
  useEffect(() => {
    const list = listRef.current
    const item = list?.children[active] as HTMLElement | undefined
    if (!list || !item) return
    if (item.offsetTop < list.scrollTop) list.scrollTop = item.offsetTop - 6
    else if (item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight + 6
  }, [active])

  const pick = (city: string) => { onChange(city); setOpen(false); setActive(-1) }
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive(i => Math.min(i + 1, matches.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && shown && active >= 0) { e.preventDefault(); pick(matches[active]!) }
    else if (e.key === 'Escape' && shown) { e.preventDefault(); setOpen(false) }
  }

  return (
    <div className="relative flex w-full flex-col"
      onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) { setOpen(false); onBlur() } }}>
      <div data-invalid={error ? '' : undefined} className={`${box(error)} h-11 gap-2`}>
        <GlobalSearchIcon />
        <input ref={inputRef} id={id} role="combobox" value={value} placeholder="Enter the name of your city"
          autoComplete="off" spellCheck={false}
          aria-labelledby={labelledBy} aria-expanded={shown} aria-controls={listId} aria-autocomplete="list"
          aria-activedescendant={shown && active >= 0 ? `${listId}-${active}` : undefined}
          aria-invalid={error ? true : undefined} aria-describedby={error ? hintId : undefined}
          onChange={e => { onChange(e.target.value); setOpen(true); setActive(-1) }}
          onKeyDown={onKey}
          className={INPUT} />
        <button type="button" tabIndex={-1} aria-label="Show cities" onMouseDown={e => e.preventDefault()}
          onClick={() => { setOpen(o => !o); inputRef.current?.focus({ preventScroll: true }) }} className="flex">
          <m.span className="flex" animate={{ rotate: shown ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <MaskSvg src="chevron-down.svg" width={20} height={20} className="text-(--mf-fg-quaternary)" />
          </m.span>
        </button>
      </div>
      <Hint id={hintId} error={error} />

      <AnimatePresence>
        {shown && (
          <m.ul ref={listRef} id={listId} role="listbox" aria-label="Cities"
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
            className="absolute top-12 left-0 z-20 flex max-h-[264px] w-full flex-col gap-0.5 overflow-y-auto rounded-lg border border-(--mf-border) bg-(--mf-bg-primary) p-1.5 shadow-[0_12px_16px_-4px_rgba(16,24,40,0.08),0_4px_6px_-2px_rgba(16,24,40,0.03)] [scrollbar-width:thin]">
            {matches.map((city, i) => (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events -- keys are handled on the input (aria-activedescendant)
              <li key={city} id={`${listId}-${i}`} role="option" aria-selected={i === active}
                onMouseDown={e => e.preventDefault()} onClick={() => pick(city)} onPointerEnter={canHover ? () => setActive(i) : undefined}
                className={`flex h-10 shrink-0 cursor-pointer items-center rounded-md px-2.5 transition-colors ${i === active ? 'bg-(--mf-bg-tertiary)' : ''}`}>
                <span className="mf-ff-body text-[16px] leading-[1.45] text-(--mf-text)">{city}</span>
              </li>
            ))}
          </m.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 self-start">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="peer sr-only" />
      <span aria-hidden className={`relative block size-6 shrink-0 rounded-[7.2px] border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--demo-accent) ${
        checked ? 'border-(--mf-gray-800) bg-(--mf-gray-800)' : 'border-(--mf-border) bg-(--mf-bg-primary)'
      }`}>
        <AnimatePresence initial={false}>
          {checked && (
            <m.span key="check" className="absolute inset-[15%] flex" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Svg src="check.svg" width={16.8} height={16.8} />
            </m.span>
          )}
        </AnimatePresence>
      </span>
      <span className="mf-trim mf-ff text-[18px] leading-[1.45] whitespace-nowrap text-(--mf-gray-800)">{label}</span>
    </label>
  )
}

/** On / off, for "Split donation evenly". */
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <m.button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className="flex h-5 w-9 shrink-0 items-center rounded-full p-0.5"
        initial={false} animate={{ backgroundColor: checked ? 'var(--mf-gray-800)' : 'var(--mf-bg-tertiary)' }} transition={{ duration: 0.2 }}>
        <m.span className="mf-shadow-sm block size-4 rounded-full bg-(--mf-bg-primary)" initial={false} animate={{ x: checked ? 16 : 0 }} transition={SPRING} />
      </m.button>
      <span className="mf-trim mf-ff text-[18px] leading-[1.45] font-medium whitespace-nowrap text-(--mf-text-secondary)">{label}</span>
    </label>
  )
}

// ── When to give ─────────────────────────────────────────────────────

const TIMES: { id: GiveTime; label: string; fill: string }[] = [
  { id: 'jummah', label: 'Friday jummah time', fill: 'var(--mf-yellow-400)' },
  { id: 'sunset', label: 'Last hour before sunset', fill: 'var(--mf-error-300)' },
]

/**
 * The web frame's two tabs. The picked one is a chip (yellow for jummah,
 * coral for sunset) that slides across; the other is set small, in
 * Satoshi, exactly as in the file.
 */
export function TimeTabs({ value, onChange, labelledBy }: { value: GiveTime; onChange: (t: GiveTime) => void; labelledBy: string }) {
  const index = TIMES.findIndex(t => t.id === value)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const onKey = (e: KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
    e.preventDefault()
    const next = index === 0 ? 1 : 0
    onChange(TIMES[next]!.id)
    refs.current[next]?.focus()
  }
  return (
    // The track is 480px: a 1px border, 3px padding (4px in the file, where the stroke sits inside) and a 4px gap, so each tab is 234px.
    <div role="radiogroup" aria-labelledby={labelledBy} className="relative flex w-[480px] items-center gap-1 rounded-[10px] border border-(--mf-border-secondary) bg-(--mf-bg-secondary-alt) p-[3px]">
      <m.span aria-hidden className="mf-shadow-sm absolute top-[3px] left-[3px] h-9 w-[234px] rounded-md"
        initial={false} animate={{ x: index * 238, backgroundColor: TIMES[index]!.fill }} transition={SPRING} />
      {TIMES.map((t, i) => {
        const on = i === index
        return (
          <button key={t.id} ref={el => { refs.current[i] = el }} type="button" role="radio" aria-checked={on} tabIndex={on ? 0 : -1}
            onClick={() => onChange(t.id)} onKeyDown={onKey}
            className="relative flex h-9 min-w-0 flex-1 items-center justify-center rounded-md px-3 py-2 whitespace-nowrap">
            <m.span key={String(on)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}
              className={on
                ? 'mf-trim mf-ff text-[18px] leading-[1.45] font-medium text-(--mf-text)'
                : 'font-(family-name:--font-satoshi) text-[14px] leading-5 font-bold text-(--mf-text-quaternary)'}>
              {t.label}
            </m.span>
          </button>
        )
      })}
    </div>
  )
}

// ── Summary ──────────────────────────────────────────────────────────

export function WeeklyTotal({ total, currency }: { total: number; currency: string }) {
  return (
    <div className="flex items-center gap-2 text-[20px] leading-[1.3] tracking-[0.04px] whitespace-nowrap">
      <span className="mf-trim font-semibold text-(--mf-text)">Weekly total :</span>
      <span className="mf-trim font-bold text-(--mf-gray-800)"><RollingText text={money(total, currency)} /></span>
    </div>
  )
}

function SummaryRow({ label, value, action }: { label: string; value: string; action?: ReactNode }) {
  return (
    <div className="flex w-full items-center justify-between text-[18px] leading-[1.45] whitespace-nowrap text-(--mf-text)">
      <span className="mf-trim mf-ff">{label}</span>
      {action}
      <span className="mf-trim mf-ff font-medium"><RollingText text={value} /></span>
    </div>
  )
}

/** "Remove" under the tip and the fee; it reads "Add" once removed. */
function RowAction({ on, what, onClick }: { on: boolean; what: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="mf-trim text-[16px] leading-[1.45] text-(--mf-text-tertiary) underline decoration-from-font [text-underline-position:from-font] [font-feature-settings:'ss05'_1] transition-colors demo-hover:text-(--mf-text)">
      {on ? 'Remove' : 'Add'}<span className="sr-only"> {what}</span>
    </button>
  )
}

export function SummaryRows({ pay }: { pay: Checkout }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <SummaryRow label="Donation" value={moneyShort(pay.donation, pay.currency)} />
      <SummaryRow label="Tip" value={money(pay.tip, pay.currency)} action={<RowAction on={pay.tipRate > 0} what="the tip" onClick={pay.toggleTip} />} />
      <SummaryRow label="Payment fee" value={money(pay.fee, pay.currency)} action={<RowAction on={pay.coverFee} what="the payment fee" onClick={pay.toggleFee} />} />
    </div>
  )
}

// ── Payment method ───────────────────────────────────────────────────

export const METHODS: { id: PayMethod; label: string; logo: ReactNode }[] = [
  { id: 'card', label: 'Card', logo: <CardIcon /> },
  { id: 'apple', label: 'Apple Pay', logo: <ApplePayLogo /> },
  { id: 'google', label: 'Google Pay', logo: <GooglePayLogo /> },
  { id: 'paypal', label: 'PayPal', logo: <PayPalLogo /> },
]

/** Card, Apple Pay, Google Pay, PayPal: the picked one turns grey. */
export function PaymentMethods({ id, value, onChange, error }: { id: string; value: PayMethod | null; onChange: (m: PayMethod) => void; error?: string }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const index = METHODS.findIndex(x => x.id === value)
  const focusable = index < 0 ? 0 : index
  const onKey = (e: KeyboardEvent, i: number) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (i + step + METHODS.length) % METHODS.length
    onChange(METHODS[next]!.id)
    refs.current[next]?.focus()
  }
  return (
    <div className="flex w-full flex-col">
      <div role="radiogroup" aria-label="Payment method" aria-describedby={error ? `${id}-hint` : undefined} className="flex h-11 w-full gap-2">
        {METHODS.map((method, i) => {
          const on = method.id === value
          return (
            <m.button key={method.id} ref={el => { refs.current[i] = el }} id={i === focusable ? id : undefined}
              type="button" role="radio" aria-checked={on} aria-label={method.label} tabIndex={i === focusable ? 0 : -1}
              onClick={() => onChange(method.id)} onKeyDown={e => onKey(e, i)}
              className="mf-card-shadow flex h-full min-w-0 flex-1 items-center justify-center rounded-lg border border-white/12 px-3.5 py-2.5"
              initial={false} animate={{ backgroundColor: on ? 'var(--mf-pay-picked)' : 'var(--mf-pay-idle)' }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
              {method.logo}
            </m.button>
          )
        })}
      </div>
      <Hint id={`${id}-hint`} error={error} />
    </div>
  )
}

/** Opens the card form under the payment methods. */
const EXPAND = { open: { height: 'auto', opacity: 1 }, closed: { height: 0, opacity: 0 } }

export function Expand({ open, children }: { open: boolean; children: ReactNode }) {
  // Clipped only while it grows or folds: once open, the billing Country
  // list has to hang over the rows below instead of being cut off. (A
  // transitionEnd can't do this: Motion uses its own to land height on auto.)
  // Already open when it mounts (no animation to finish): unclipped from the start.
  const overflow = useMotionValue(open ? 'visible' : 'hidden')
  return (
    <AnimatePresence initial={false}>
      {open && (
        <m.div key="expand" style={{ overflow }} variants={EXPAND} initial="closed" animate="open" exit="closed"
          onAnimationStart={() => overflow.set('hidden')}
          onAnimationComplete={name => { if (name === 'open') overflow.set('visible') }}
          transition={{ type: 'spring', stiffness: 380, damping: 36 }}>
          {children}
        </m.div>
      )}
    </AnimatePresence>
  )
}

// ── Donation split (charity) ─────────────────────────────────────────

export function SplitPanel({ pay, id }: { pay: Checkout; id: string }) {
  const titleId = `${id}-title`
  return (
    <section aria-labelledby={titleId} className="mf-card-shadow flex flex-col gap-5 rounded-lg border border-(--mf-border) bg-(--mf-bg-primary) p-[15px]">
      <div className="flex items-center justify-between">
        <h3 id={titleId} className="mf-trim text-[20px] leading-[1.3] font-bold tracking-[0.04px] whitespace-nowrap text-(--mf-gray-800)">Donation split</h3>
        <Toggle checked={pay.evenly} onChange={pay.setEvenly} label="Split donation evenly" />
      </div>
      <div className="flex flex-col">
        <div className="flex flex-col gap-4">
          {SPLIT_CAUSES.map((cause, i) => {
            const name = CAUSES.find(c => c.id === cause)!.name
            const amount = pay.split[i]!
            return (
              // Split evenly, the amounts are worked out for you and sit in the placeholder colour, as in the file.
              <label key={cause} className={`mf-field flex h-12 cursor-text items-center justify-between rounded-lg border bg-(--mf-bg-primary) px-[13px] py-2.5 transition-colors focus-within:border-(--mf-text-secondary) ${
                pay.errorFor('split') ? 'border-(--mf-error-300)' : 'border-(--mf-border)'
              }`}>
                <span className={`mf-ff flex items-center gap-1 text-[18px] leading-[1.45] ${pay.evenly ? 'text-(--mf-text-placeholder)' : 'text-(--mf-text)'}`}>
                  <span aria-hidden>{pay.currency}</span>
                  <input id={i === 0 ? id : undefined} inputMode="decimal" autoComplete="off" value={amount}
                    aria-label={`Weekly amount for ${name} (${pay.currency})`}
                    onChange={e => pay.setSplitAmount(i, e.target.value)} onBlur={() => pay.blur('split')}
                    className="bg-transparent font-bold outline-none" style={{ width: `${Math.max(1, amount.length) + 0.5}ch` }} />
                </span>
                <span className="flex items-center gap-2 whitespace-nowrap text-(--mf-text)">
                  <span className="mf-ff-body text-[16px] leading-[1.45]">For</span>
                  <span className="flex items-center gap-1">
                    <SplitIcon name={cause} />
                    <span className="mf-trim text-[16px] leading-[1.3] font-medium tracking-[0.032px]">{name}</span>
                  </span>
                </span>
              </label>
            )
          })}
        </div>
        <Hint id={`${id}-hint`} error={pay.errorFor('split')} />
      </div>
    </section>
  )
}

// ── Receipt ──────────────────────────────────────────────────────────

/** How you paid, as the receipt shows it: the wallet's logo, or the card's last digits. */
export function MethodMark({ method, last4 }: { method: PayMethod | null; last4: string }) {
  switch (method) {
    case 'apple': return <span role="img" aria-label="Apple Pay"><ApplePayLogo /></span>
    case 'google': return <span role="img" aria-label="Google Pay"><GooglePayLogo /></span>
    case 'paypal': return <span role="img" aria-label="PayPal"><PayPalLogo /></span>
    default: return (
      <span className="flex items-center gap-2">
        <CardIcon />
        <span className="mf-trim mf-ff text-[18px] leading-[1.45] font-medium">Card ending {last4}</span>
      </span>
    )
  }
}
