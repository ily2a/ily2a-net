'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { MaskSvg, SearchIcon } from './assets'
import { CAUSES, CHARITIES, type Cause, type Charity } from './data'
import { COUNTRIES, type Country } from './CountrySelect'

// What the web and mobile landings share: one state, so switching layout
// keeps your tab, search, country, pick and amount, plus the controls both
// frames draw the same way. Home.tsx and HomeMobile.tsx only arrange them.

export type Tab = 'causes' | 'charities'

/** What you picked on the landing. */
export type Pick = { kind: 'cause'; cause: Cause } | { kind: 'charity'; charity: Charity }

/** What Donate hands to Payment: the pick, its weekly amount and the country it's in. */
export type DonationTarget = Pick & { amount: number; country: Country }

// Search matches card titles only.
const matches = (item: { name: string }, needle: string) =>
  !needle || item.name.toLowerCase().includes(needle)

// ── State ────────────────────────────────────────────────────────────

export function useLanding(onDonate: (target: DonationTarget) => void) {
  const [tab, setTab] = useState<Tab>('causes')
  const [query, setQuery] = useState('')
  // Nothing is picked until you tap a card (null = no card open).
  const [cause, setCause] = useState<string | null>(null)
  const [charity, setCharity] = useState<string | null>(null)
  const [amount, setAmount] = useState('5')
  const [country, setCountry] = useState<Country>(COUNTRIES[0]!)

  const q = query.trim().toLowerCase()
  const causes = CAUSES.filter(c => matches(c, q))
  // Each country has its own registered charities, so a pick from another
  // country's list leaves nothing selected.
  const countryCharities = CHARITIES[country.id]
  const activeCharity = charity && countryCharities.some(c => c.id === charity) ? charity : null
  const charities = countryCharities.filter(c => matches(c, q))

  // Search covers both lists. If the open tab has nothing for the query but
  // the other one does, switch to it (the chip slides across).
  const onSearch = (value: string) => {
    setQuery(value)
    const needle = value.trim().toLowerCase()
    if (!needle) return
    const inCauses = CAUSES.some(c => matches(c, needle))
    const inCharities = countryCharities.some(c => matches(c, needle))
    if (tab === 'causes' && !inCauses && inCharities) setTab('charities')
    else if (tab === 'charities' && !inCharities && inCauses) setTab('causes')
  }

  const donate = (pick: Pick) => onDonate({ ...pick, amount: Number(amount), country })
  /** Closes the open card, after a donation or a cancelled one. */
  const clearPick = () => { setCause(null); setCharity(null) }

  return {
    tab, setTab, query, onSearch,
    cause, setCause, charity: activeCharity, setCharity,
    amount, setAmount, country, setCountry,
    causes, charities, donate, clearPick,
    /** Result counts for the tabs while searching. */
    counts: q ? { causes: causes.length, charities: charities.length } : undefined,
    /** The open tab has nothing for the search. */
    empty: tab === 'causes' ? causes.length === 0 : charities.length === 0,
  }
}

export type Landing = ReturnType<typeof useLanding>

// ── Type ─────────────────────────────────────────────────────────────

export const TITLE = 'mf-trim text-[20px] leading-[1.3] font-semibold tracking-[0.04px] whitespace-nowrap text-(--mf-text)'
export const BODY = 'mf-trim mf-ff-body w-full text-[16px] leading-[1.45] text-(--mf-text)'

// ── Countdown to Friday ──────────────────────────────────────────────
// The file shows "1 Day 3 Hours 28 minutes"; here it ticks down live, to
// the second, to the next Friday at 4pm local time (roughly Maghrib in a
// UK winter). Each number rolls down to its new value like a flip clock.

export function nextFriday(now: number) {
  const d = new Date(now)
  const target = new Date(d)
  target.setHours(16, 0, 0, 0)
  let add = (5 - d.getDay() + 7) % 7
  if (add === 0 && d >= target) add = 7
  target.setDate(target.getDate() + add)
  return target.getTime()
}

function useCountdown() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const secs = Math.max(0, Math.floor((nextFriday(now) - now) / 1000))
  return {
    days: Math.floor(secs / 86400),
    hours: Math.floor((secs % 86400) / 3600),
    minutes: Math.floor((secs % 3600) / 60),
    seconds: secs % 60,
  }
}

/** A number that rolls down to its new value; tabular figures so it never jitters. */
function RollingNumber({ value, pad = false }: { value: number; pad?: boolean }) {
  return <RollingText text={pad ? String(value).padStart(2, '0') : String(value)} />
}

/** Text that rolls down to its new value (the countdown, Payment's totals). */
export function RollingText({ text }: { text: string }) {
  return (
    <span className="relative inline-grid overflow-hidden tabular-nums">
      <AnimatePresence initial={false}>
        <m.span
          key={text}
          className="[grid-area:1/1] text-right"
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        >
          {text}
        </m.span>
      </AnimatePresence>
    </span>
  )
}

function TimeUnit({ value, one, many, pad }: { value: number; one: string; many: string; pad?: boolean }) {
  return (
    <span className="inline-flex items-center gap-[0.25em]">
      <RollingNumber value={value} pad={pad} />
      <span>{value === 1 ? one : many}</span>
    </span>
  )
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/** The live countdown, styled by each layout. */
export function Countdown({ className }: { className: string }) {
  const { days, hours, minutes, seconds } = useCountdown()
  return (
    <>
      {/* Ticks every second, so it's hidden from screen readers; the text below changes once a minute and isn't announced. */}
      <p aria-hidden className={className}>
        {days > 0 && <TimeUnit value={days} one="Day" many="Days" />}
        <TimeUnit value={hours} one="Hour" many="Hours" />
        <TimeUnit value={minutes} one="minute" many="minutes" pad />
        <TimeUnit value={seconds} one="second" many="seconds" pad />
      </p>
      <span className="sr-only">
        Time left: {days > 0 ? `${plural(days, 'day', 'days')}, ` : ''}{plural(hours, 'hour', 'hours')} and {plural(minutes, 'minute', 'minutes')}
      </span>
    </>
  )
}

// ── Controls ─────────────────────────────────────────────────────────

export function Tabs({ tab, onChange, counts }: { tab: Tab; onChange: (t: Tab) => void; counts?: Record<Tab, number> }) {
  // The active chip slides between the tabs and changes fill on the way:
  // amber for Causes, coral for Charities. The idle tab keeps its colour as
  // text, like the landing frames. The track is 353px with a 1px border
  // and a 2px gap, so each tab is 174.5px and the chip travels 176.5px.
  const causes = tab === 'causes'
  const base = 'mf-ff relative z-10 flex h-full min-w-0 flex-1 items-center justify-center rounded-lg p-3 text-[18px] leading-[1.45] font-medium whitespace-nowrap transition-colors duration-200'
  return (
    <div role="tablist" aria-label="Browse by" className="relative flex h-11 w-[353px] items-center gap-0.5 rounded-lg border border-(--mf-bg-tertiary) bg-(--mf-bg-primary)">
      <m.span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[174.5px] rounded-lg border border-(--mf-border) shadow-[0_1px_2px_rgba(16,24,40,0.05)]"
        initial={false}
        animate={{ x: causes ? 0 : 176.5, backgroundColor: causes ? 'var(--mf-amber)' : 'var(--mf-coral)' }}
        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
      />
      <button type="button" role="tab" aria-selected={causes} onClick={() => onChange('causes')}
        className={`${base} ${causes ? 'text-(--mf-bg-tertiary)' : 'text-(--mf-amber)'}`}>
        Causes{counts && ` (${counts.causes})`}
      </button>
      <button type="button" role="tab" aria-selected={!causes} onClick={() => onChange('charities')}
        className={`${base} ${causes ? 'text-(--mf-coral)' : 'text-(--mf-bg-tertiary)'}`}>
        Charities{counts && ` (${counts.charities})`}
      </button>
    </div>
  )
}

/** "Find a cause or charity". Escape or the X clears it. */
export function SearchField({ query, onSearch, className }: { query: string; onSearch: (value: string) => void; className: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <label className={`mf-card-shadow flex h-11 items-center justify-between gap-2 rounded-lg border border-(--mf-border) bg-(--mf-bg-primary) px-3.5 py-2.5 transition-colors focus-within:border-(--mf-logo-orange) ${className}`}>
      <input
        type="search"
        value={query}
        ref={inputRef}
        onChange={e => onSearch(e.target.value)}
        onKeyDown={e => { if (e.key === 'Escape' && query) { e.preventDefault(); onSearch('') } }}
        placeholder="Find a cause or charity"
        aria-label="Find a cause or charity"
        className="min-w-0 flex-1 bg-transparent text-[16px] leading-6 text-(--mf-text) outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {/* The file's cancel-square icon, recoloured to match the search icon. */}
      <AnimatePresence initial={false} mode="popLayout">
        {query ? (
          <m.button
            key="clear"
            type="button"
            aria-label="Clear search"
            onClick={() => { onSearch(''); inputRef.current?.focus() }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="flex size-6 shrink-0 items-center justify-center rounded-md text-(--mf-text-secondary) transition-colors demo-hover:text-(--mf-white)"
          >
            <MaskSvg src="cancel-square.svg" width={17.08} height={17.08} />
          </m.button>
        ) : (
          <m.span
            key="search"
            className="flex"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <SearchIcon />
          </m.span>
        )}
      </AnimatePresence>
    </label>
  )
}

interface AmountRowProps {
  label: string
  currency: string
  amount: string
  onAmount: (value: string) => void
  onDonate: () => void
  /** The amount field's width: 172px on web, 216px on mobile. */
  fieldWidth: string
}

/** Weekly amount + Donate, under the picked card. */
export function AmountRow({ label, currency, amount, onAmount, onDonate, fieldWidth }: AmountRowProps) {
  const valid = Number(amount) > 0
  return (
    <div className="flex w-full items-stretch gap-2 pt-4">
      <label className={`mf-card-shadow flex h-11 shrink-0 cursor-text items-center justify-between rounded-lg border border-(--mf-border) bg-(--mf-bg-tertiary) px-3.5 py-2.5 transition-colors focus-within:border-(--mf-text-secondary) ${fieldWidth}`}>
        <span className="flex items-center gap-1 text-[16px] leading-[1.3] tracking-[0.032px]">
          <span aria-hidden className="font-medium text-(--mf-text-secondary)">{currency}</span>
          <input
            inputMode="decimal"
            aria-label={`Weekly amount for ${label} (${currency})`}
            value={amount}
            onChange={e => {
              const v = e.target.value.replace(/[^\d.]/g, '')
              if (/^\d{0,4}(\.\d{0,2})?$/.test(v)) onAmount(v)
            }}
            className="bg-transparent font-bold text-(--mf-text) outline-none"
            style={{ width: `${Math.max(1, amount.length) + 0.5}ch` }}
          />
        </span>
        <span className="mf-ff text-right text-[14px] leading-[1.45] text-(--mf-text-placeholder)">per week</span>
      </label>
      <m.button
        type="button"
        onClick={onDonate}
        disabled={!valid}
        whileTap={valid ? { scale: 0.98 } : undefined}
        className="mf-skeuo flex min-w-0 flex-1 items-center justify-center rounded-lg border-[0.464px] border-white/12 bg-(--mf-indigo) px-2 text-[16px] leading-[1.3] font-bold tracking-[0.032px] text-(--mf-white) transition-opacity disabled:opacity-50"
      >
        Donate
      </m.button>
    </div>
  )
}

/** The spring cards open and fold with. */
export const REVEAL_SPRING = { type: 'spring', stiffness: 380, damping: 36 } as const

const REVEAL = { open: { height: 'auto', opacity: 1 }, closed: { height: 0, opacity: 0 } }

/** Grows the amount row open under a picked card and folds it away again. */
export function Reveal({ open, id, onOpened, children }: { open: boolean; id: string; onOpened?: () => void; children: ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <m.div
          key="amount"
          id={id}
          className="overflow-hidden"
          onClick={e => e.stopPropagation()}
          variants={REVEAL}
          initial="closed"
          animate="open"
          exit="closed"
          transition={REVEAL_SPRING}
          onAnimationComplete={name => { if (name === 'open') onOpened?.() }}
        >
          {children}
        </m.div>
      )}
    </AnimatePresence>
  )
}
