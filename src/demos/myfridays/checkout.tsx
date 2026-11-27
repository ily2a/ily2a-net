'use client'

import { useEffect, useId, useState } from 'react'
import { CITIES, SPLIT_CAUSES } from './data'
import type { Country } from './CountrySelect'
import { nextFriday, type DonationTarget } from './landing'

// Payment's state, shared by its layouts the way useLanding is: where you
// live, when to give, Gift Aid, the tip, who covers the fee, how you pay,
// the card form and (for a charity) how the money splits across causes.

export type PayMethod = 'card' | 'apple' | 'google' | 'paypal'
export type GiveTime = 'jummah' | 'sunset'

/** The card form. address2 is the mobile frame's optional second line. */
export type CardField = 'number' | 'expiry' | 'cvc' | 'first' | 'last' | 'address' | 'address2' | 'city' | 'postcode' | 'phone'
export type Field = 'location' | 'time' | 'split' | 'method' | CardField
type CardDetails = Record<CardField, string>

const CARD_FIELDS: CardField[] = ['number', 'expiry', 'cvc', 'first', 'last', 'address', 'address2', 'city', 'postcode', 'phone']
/** What Donate needs (web, and the phone's last Next), top to bottom so a failed try lands on the first thing to fix. */
const DONATE_FIELDS: Field[] = ['location', 'split', 'method', ...CARD_FIELDS]
/** The phone's Info step. The web frame picks a time for you; the phone asks. */
export const INFO_FIELDS: Field[] = ['location', 'time']
const EMPTY_CARD: CardDetails = { number: '', expiry: '', cvc: '', first: '', last: '', address: '', address2: '', city: '', postcode: '', phone: '' }

/** Tip choices, as a share of the weekly donation. The file defaults to 5%. */
export const TIP_RATES = [0, 0.05, 0.1, 0.15] as const
/** Card processing: a flat 0.80 like the file, in the donor's currency. */
const FEE = 0.8

// ── Money ────────────────────────────────────────────────────────────

export const round2 = (n: number) => Math.round(n * 100) / 100
/** "£ 0.50", the summary's format. */
export const money = (n: number, currency: string) => `${currency} ${n.toFixed(2)}`
/** "£10", the donation line's: whole amounts without pence. */
export const moneyShort = (n: number, currency: string) => `${currency}${Number.isInteger(n) ? n : n.toFixed(2)}`

const amountText = (cents: number) => (cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2))

/** Splits an amount evenly; the odd pence go to the first causes. */
export function splitEvenly(amount: number, parts: number) {
  const cents = Math.round(amount * 100)
  const base = Math.floor(cents / parts)
  return Array.from({ length: parts }, (_, i) => amountText(base + (i < cents % parts ? 1 : 0)))
}

// ── Card form ────────────────────────────────────────────────────────

const digits = (s: string) => s.replace(/\D/g, '')
const isAmex = (n: string) => /^3[47]/.test(digits(n))

/** Keeps what's typed in the shape each field expects. */
function format(field: CardField, raw: string, cardNumber: string) {
  switch (field) {
    case 'number': {
      const amex = isAmex(raw)
      const d = digits(raw).slice(0, amex ? 15 : 16)
      const groups = amex ? [4, 6, 5] : [4, 4, 4, 4]
      const parts: string[] = []
      let at = 0
      for (const g of groups) { if (at < d.length) parts.push(d.slice(at, at + g)); at += g }
      return parts.join(' ')
    }
    case 'expiry': {
      const d = digits(raw).slice(0, 4)
      return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
    }
    case 'cvc': return digits(raw).slice(0, isAmex(cardNumber) ? 4 : 3)
    case 'phone': return raw.replace(/[^\d+()\s-]/g, '').slice(0, 20)
    case 'postcode': return raw.toUpperCase().slice(0, 10)
    default: return raw.slice(0, 60)
  }
}

function cardError(field: CardField, card: CardDetails, today: Date): string | undefined {
  const v = card[field].trim()
  switch (field) {
    case 'number': {
      const need = isAmex(v) ? 15 : 16
      const have = digits(v).length
      if (have === need) return
      return have ? `Enter all ${need} digits of the card number` : 'Enter your card number'
    }
    case 'expiry': {
      const match = /^(\d{2})\/(\d{2})$/.exec(v)
      if (!match) return 'Enter the expiry date as MM/YY'
      const month = Number(match[1])
      if (month < 1 || month > 12) return 'Enter a month from 01 to 12'
      // A card works to the end of its expiry month.
      return new Date(2000 + Number(match[2]), month) <= today ? 'This card has expired' : undefined
    }
    case 'cvc': {
      const need = isAmex(card.number) ? 4 : 3
      return digits(v).length === need ? undefined : `Enter the ${need}-digit security code`
    }
    case 'first': return v ? undefined : 'Enter your first name'
    case 'last': return v ? undefined : 'Enter your last name'
    case 'address': return v ? undefined : 'Enter your address'
    case 'address2': return undefined
    case 'city': return v ? undefined : 'Enter your city'
    case 'postcode': return v ? undefined : 'Enter your postcode'
    case 'phone': return digits(v).length >= 7 ? undefined : 'Enter your phone number'
  }
}

// ── Dates ────────────────────────────────────────────────────────────

const LOCALES: Record<Country['id'], string> = { gb: 'en-GB', us: 'en-US', au: 'en-AU' }

/** "Friday 04/12/2026": the receipt's start date, in the donor's date order. */
function startDate(placedAt: number, country: Country) {
  const day = new Date(nextFriday(placedAt))
  const locale = LOCALES[country.id]
  return `${day.toLocaleDateString(locale, { weekday: 'long' })} ${day.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })}`
}

// ── State ────────────────────────────────────────────────────────────

export function useCheckout(target: DonationTarget) {
  const uid = useId()
  const { country } = target
  const currency = country.currency

  const [location, setLocation] = useState('')
  // Last hour before sunset is the web frame's default; the phone shows
  // "Choose the time of your donation" until you pick one.
  const [time, setTimeValue] = useState<GiveTime>('sunset')
  const [timePicked, setTimePicked] = useState(false)
  const [giftAid, setGiftAid] = useState(true)
  const [tipRate, setTipRate] = useState<number>(0.05)
  const [tipPicked, setTipPicked] = useState(false)
  const [coverFee, setCoverFee] = useState(true)
  const [method, setMethod] = useState<PayMethod | null>(null)
  const [card, setCard] = useState<CardDetails>(EMPTY_CARD)
  const [billing, setBillingCountry] = useState<Country>(country)
  const [billingPicked, setBillingPicked] = useState(false)
  const [evenly, setEvenly] = useState(true)
  const [split, setSplit] = useState(() => splitEvenly(target.amount, SPLIT_CAUSES.length))
  const [touched, setTouched] = useState<Partial<Record<Field, true>>>({})
  // Fields whose step you tried to leave unfinished: they show their errors.
  const [tried, setTried] = useState<Partial<Record<Field, true>>>({})
  const [step, setStep] = useState<'info' | 'pay'>('info')
  const [status, setStatus] = useState<'editing' | 'sending' | 'done'>('editing')
  const [placedAt, setPlacedAt] = useState(0)
  const [today] = useState(() => new Date())

  const donation = target.kind === 'cause'
    ? target.amount
    : round2(split.reduce((sum, a) => sum + (Number(a) || 0), 0))
  const tip = round2(donation * tipRate)
  const fee = coverFee ? FEE : 0
  const total = round2(donation + tip + fee)

  const errors: Partial<Record<Field, string>> = {}
  if (location.trim().length < 2) errors.location = 'Enter the city you live in'
  if (!timePicked) errors.time = 'Choose when to donate'
  if (target.kind === 'charity' && donation <= 0) errors.split = 'Add an amount for at least one cause'
  if (!method) errors.method = 'Choose how you’d like to pay'
  if (method === 'card') {
    for (const f of CARD_FIELDS) {
      const e = cardError(f, card, today)
      if (e) errors[f] = e
    }
  }
  const validFor = (fields: Field[]) => fields.every(f => !errors[f])
  const valid = validFor(DONATE_FIELDS)
  /** Marks a step's fields as tried and returns the first that needs fixing. */
  const check = (fields: Field[]): Field | null => {
    const first = fields.find(f => errors[f]) ?? null
    if (first) setTried(t => ({ ...t, ...Object.fromEntries(fields.map(f => [f, true])) }))
    return first
  }

  // A short "sending" beat on the button, then the receipt.
  useEffect(() => {
    if (status !== 'sending') return
    const t = setTimeout(() => setStatus('done'), 700)
    return () => clearTimeout(t)
  }, [status])

  const tipLabel = (rate: number) =>
    rate === 0 ? 'No tip' : `${money(round2(donation * rate), currency)} (${Math.round(rate * 100)}%)`

  return {
    target, currency,
    location, setLocation,
    cities: CITIES[country.id],
    time, timePicked,
    setTime: (t: GiveTime) => { setTimeValue(t); setTimePicked(true) },
    /** Gift Aid is a UK scheme. */
    giftAidApplies: country.id === 'gb',
    giftAid, setGiftAid,
    tipRate, tipPicked,
    tipOptions: TIP_RATES.map(rate => ({ id: String(rate), label: tipLabel(rate) })),
    pickTip: (rate: number) => { setTipRate(rate); setTipPicked(true) },
    /** The summary's Remove / Add on the tip line. */
    toggleTip: () => { setTipRate(r => (r > 0 ? 0 : 0.05)); setTipPicked(true) },
    coverFee, toggleFee: () => setCoverFee(c => !c),
    method, setMethod,
    card,
    setCardField: (field: CardField, raw: string) => setCard(c => ({ ...c, [field]: format(field, raw, c.number) })),
    billing, billingPicked,
    /** The billing city completes from the billing country's cities. */
    billingCities: CITIES[billing.id],
    setBilling: (c: Country) => { setBillingCountry(c); setBillingPicked(true) },
    split, evenly,
    setSplitAmount: (i: number, raw: string) => {
      const v = raw.replace(/[^\d.]/g, '')
      if (!/^\d{0,4}(\.\d{0,2})?$/.test(v)) return
      setSplit(s => s.map((a, j) => (j === i ? v : a)))
      setEvenly(false)
    },
    /** Turning "Split donation evenly" back on shares the current total out again. */
    setEvenly: (on: boolean) => {
      if (on) setSplit(splitEvenly(donation, SPLIT_CAUSES.length))
      setEvenly(on)
    },
    donation, tip, fee, total,
    valid, status, step, setStep,
    infoValid: validFor(INFO_FIELDS),
    check,
    /** Shown once you've left the field, or tried to move on without it. */
    errorFor: (f: Field) => (tried[f] || touched[f] ? errors[f] : undefined),
    blur: (f: Field) => setTouched(t => (t[f] ? t : { ...t, [f]: true })),
    fieldId: (f: Field) => `${uid}-${f}`,
    /** Donate: sends it, or shows what's missing and returns the first field to fix. */
    submit: (): Field | null => {
      const first = check(DONATE_FIELDS)
      if (first) return first
      setPlacedAt(Date.now())
      setStatus('sending')
      return null
    },
    receipt: {
      city: location.trim(),
      start: placedAt ? startDate(placedAt, country) : '',
      last4: digits(card.number).slice(-4),
    },
  }
}

export type Checkout = ReturnType<typeof useCheckout>
