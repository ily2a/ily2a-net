'use client'

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { CauseIcon, CharityLogo, SplitIcon, Svg } from './assets'
import { INFO_FIELDS, money, type CardField, type Checkout, type GiveTime } from './checkout'
import {
  Checkbox, CityAutocomplete, CityField, Expand, FieldLabel, Hint, MethodMark, Panel, PanelHead, PaymentMethods, PrimaryButton,
  SecondaryButton, SummaryRows, TextField, WeeklyTotal,
} from './checkout-ui'
import { CountrySelect } from './CountrySelect'
import { CAUSES, SPLIT_CAUSES } from './data'
import { Header, StatusBar } from './HomeMobile'
import type { DonationTarget } from './landing'
import { focusField } from './Payment'
import { Select } from './Select'

// MyFridays Payment on the phone (Figma: Payment › "Payment 1/3", "2/3",
// "3/3", "Payment recipt" and "Donation to specific charity"). Three steps
// under a fixed status bar and logo bar: Info → Payment → Summary (the
// receipt). Same state as the web page, so switching layout keeps what
// you've filled in.

type Screen = 'info' | 'pay' | 'summary'

const SLIDE = {
  enter: (dir: number) => ({ x: dir * 48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -48, opacity: 0 }),
}

const NAV = {
  cause: ['Blog', 'My Donations', 'Log Out'],
  charity: ['Blog', 'Causes', 'My Donations', 'Log Out'],
} as const

const TIMES = [
  { id: 'jummah', label: 'Friday jummah time' },
  { id: 'sunset', label: 'Last hour before sunset' },
]

// ── Pieces ───────────────────────────────────────────────────────────

function BackArrow({ onClick }: { onClick: () => void }) {
  // The padding grows the tap target to 44px without moving the arrow.
  return (
    <button type="button" aria-label="Back" onClick={onClick} className="-m-2.5 flex shrink-0 rounded-md p-2.5">
      <Svg src="back-arrow.svg" width={24} height={24} />
    </button>
  )
}

const STEPS = ['Info', 'Payment', 'Summary'] as const
// Where the file sets each label under its bar: Info at the start, Payment
// about the middle, Summary toward the end.
const LABEL_AT = ['left-2', 'left-[calc(50%-39.5px)]', 'left-[calc(100%-84px)]'] as const

/** Three bars, filled up to the step you're on; the one you've just reached fills in. */
function Stepper({ at, focusRef }: { at: 0 | 1 | 2; focusRef?: RefObject<HTMLOListElement | null> }) {
  return (
    <div className="relative flex min-w-0 flex-1 items-center gap-2 p-2">
      {STEPS.map((step, i) => (
        <span key={step} aria-hidden className="relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-[2px] bg-(--mf-border)">
          {i <= at && (
            <m.span className="absolute inset-0 origin-left bg-(--mf-gray-800)"
              initial={i === at && at > 0 ? { scaleX: 0 } : false} animate={{ scaleX: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 32, delay: 0.15 }} />
          )}
        </span>
      ))}
      {/* Out of the flex flow (it would add a gap); the labels hang 22px down, under their bars. */}
      <ol ref={focusRef} tabIndex={-1} aria-label={`Step ${at + 1} of 3: ${STEPS[at]}`} className="absolute inset-0 outline-none">
        {STEPS.map((step, i) => (
          <li key={step} aria-current={i === at ? 'step' : undefined}
            className={`mf-trim absolute top-[22px] text-[16px] leading-[1.45] whitespace-nowrap ${LABEL_AT[i]} ${
              i <= at ? 'mf-ff font-medium text-(--mf-gray-800)' : 'mf-ff-body text-(--mf-text-placeholder)'
            }`}>
            {step}
          </li>
        ))}
      </ol>
    </div>
  )
}

/** The cause or charity beside "Donation": its 24px icon and name. */
function TargetChip({ target }: { target: DonationTarget }) {
  const name = target.kind === 'cause' ? target.cause.name : target.charity.name
  return (
    <span className="mf-card-shadow flex min-w-0 items-center gap-2 rounded-md border border-(--mf-border) bg-(--mf-bg-primary) px-[11px] py-[7px]">
      {target.kind === 'cause' ? <CauseIcon name={target.cause.id} /> : <CharityLogo logo={target.charity.logo} size={24} />}
      {/* A 30px line box pulled to the icon's 24px, so long names can truncate without clipping. */}
      <span className="-my-[3px] min-w-0 truncate text-[20px] leading-[30px] font-medium tracking-[0.04px] text-(--mf-text)">{name}</span>
    </span>
  )
}

function Actions({ children }: { children: ReactNode }) {
  return <div className="flex w-full items-center gap-5">{children}</div>
}

/** The phone's donation split: no toggle in this frame, so the amounts are yours to set. */
function SplitCard({ pay }: { pay: Checkout }) {
  const id = pay.fieldId('split')
  return (
    <Panel dense className="items-center" labelledBy={`${id}-title`}>
      <h3 id={`${id}-title`} className="mf-trim text-[20px] leading-[1.3] font-bold tracking-[0.04px] whitespace-nowrap text-(--mf-gray-800)">Donation split</h3>
      <div className="flex w-full flex-col">
        <div className="flex flex-col gap-4">
          {SPLIT_CAUSES.map((cause, i) => {
            const name = CAUSES.find(c => c.id === cause)!.name
            const amount = pay.split[i]!
            return (
              <label key={cause} className={`mf-field flex h-12 cursor-text items-center justify-between rounded-lg border bg-(--mf-bg-primary) p-[15px] transition-colors focus-within:border-(--mf-text-secondary) ${
                pay.errorFor('split') ? 'border-(--mf-error-300)' : 'border-(--mf-border)'
              }`}>
                <span className="mf-ff flex items-center gap-1 text-[18px] leading-[1.45]">
                  <span aria-hidden className="text-(--mf-text-secondary)">{pay.currency}</span>
                  <input id={i === 0 ? id : undefined} inputMode="decimal" autoComplete="off" value={amount}
                    aria-label={`Weekly amount for ${name} (${pay.currency})`}
                    onChange={e => pay.setSplitAmount(i, e.target.value)} onBlur={() => pay.blur('split')}
                    className="bg-transparent font-bold text-(--mf-text) outline-none" style={{ width: `${Math.max(1, amount.length) + 0.5}ch` }} />
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
    </Panel>
  )
}

// ── Steps ────────────────────────────────────────────────────────────

interface StepProps {
  pay: Checkout
  scrollRef: RefObject<HTMLDivElement | null>
  focusRef: RefObject<HTMLOListElement | null>
}

function InfoStep({ pay, scrollRef, focusRef, onBack, onCancel, onNext }: StepProps & { onBack: () => void; onCancel: () => void; onNext: () => void }) {
  const ids = useId()
  const { fieldId, errorFor, blur } = pay
  const next = () => {
    const first = pay.check(INFO_FIELDS)
    if (first) focusField(fieldId(first), scrollRef.current)
    else onNext()
  }
  return (
    <>
      <div className="flex h-[86px] flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex shrink-0 items-center gap-4">
            <BackArrow onClick={onBack} />
            <h2 className="mf-trim text-[20px] leading-[1.3] font-semibold tracking-[0.04px] whitespace-nowrap text-(--mf-text)">Donation</h2>
          </div>
          <TargetChip target={pay.target} />
        </div>
        <Stepper at={0} focusRef={focusRef} />
      </div>

      <div className="flex flex-col gap-5">
        <Panel dense labelledBy={`${ids}-where`}>
          <PanelHead id={`${ids}-where`} title="Where do you live ?">
            It will help us notify you when Maghreb prayer hours arrives at your exact location
          </PanelHead>
          <CityField id={fieldId('location')} labelledBy={`${ids}-where`} cities={pay.cities}
            value={pay.location} onChange={pay.setLocation} onBlur={() => blur('location')} error={errorFor('location')} />
        </Panel>

        <Panel dense labelledBy={`${ids}-time`}>
          <PanelHead id={`${ids}-time`} title="At what time do you want to donate ?" />
          <div className="flex flex-col">
            <Select id={fieldId('time')} label="When to donate" options={TIMES} value={pay.timePicked ? pay.time : ''}
              onChange={id => pay.setTime(id as GiveTime)} placeholder="Choose the time of your donation" className="w-full"
              fieldClassName={`mf-field focus-visible:border-(--mf-text-secondary) ${errorFor('time') ? 'border-(--mf-error-300)!' : ''}`} />
            <Hint id={`${fieldId('time')}-hint`} error={errorFor('time')} />
          </div>
        </Panel>

        {pay.giftAidApplies && (
          <Panel dense labelledBy={`${ids}-gift`}>
            <PanelHead id={`${ids}-gift`} title="Gift aid">
              By selecting yes, I declare that I am a UK taxpayer and it will increase your donation for free read more
            </PanelHead>
            <Checkbox checked={pay.giftAid} onChange={pay.setGiftAid} label="Yes, I’d like to include GiftAid" />
          </Panel>
        )}

        <Panel dense labelledBy={`${ids}-tips`}>
          <PanelHead id={`${ids}-tips`} title="Your tips keep us going">Tips are taken along with your first payment.</PanelHead>
          <Select label="Tip" options={pay.tipOptions} value={String(pay.tipRate)} onChange={id => pay.pickTip(Number(id))}
            muted={!pay.tipPicked} up className="w-full" fieldClassName="mf-field focus-visible:border-(--mf-text-secondary)" />
        </Panel>
      </div>

      <Actions>
        <SecondaryButton onClick={onCancel} className="min-w-0 flex-1">Cancel</SecondaryButton>
        <PrimaryButton onClick={next} incomplete={!pay.infoValid} className="min-w-0 flex-1 px-[38px]">Next</PrimaryButton>
      </Actions>
    </>
  )
}

function PayStep({ pay, scrollRef, focusRef, onBack, onCancel }: StepProps & { onBack: () => void; onCancel: () => void }) {
  const ids = useId()
  const { card, fieldId, errorFor, blur } = pay
  const donate = () => {
    const first = pay.submit()
    if (first) focusField(fieldId(first), scrollRef.current)
  }
  const text = (field: CardField, label: string, placeholder: string, inputMode?: 'numeric' | 'tel') => (
    <TextField id={fieldId(field)} label={label} placeholder={placeholder} value={card[field]} inputMode={inputMode}
      onChange={v => pay.setCardField(field, v)} onBlur={() => blur(field)} error={errorFor(field)} />
  )
  const byCard = pay.method === 'card'

  return (
    <>
      <div className="flex items-start gap-4">
        <BackArrow onClick={onBack} />
        <Stepper at={1} focusRef={focusRef} />
      </div>

      <div className="flex flex-col gap-5">
        <Panel dense className="items-center">
          <WeeklyTotal total={pay.total} currency={pay.currency} />
          <SummaryRows pay={pay} />
        </Panel>

        {pay.target.kind === 'charity' && <SplitCard pay={pay} />}

        {/* The billing card grows in under the methods card; its gap rides inside the fold. */}
        <div className="flex flex-col">
        <Panel dense labelledBy={`${ids}-method`}>
          <h3 id={`${ids}-method`} className="mf-trim w-full text-center text-[20px] leading-[1.3] font-semibold tracking-[0.04px] text-(--mf-text)">Payment method</h3>
          <div className="flex flex-col">
            <PaymentMethods id={fieldId('method')} value={pay.method} onChange={pay.setMethod} error={errorFor('method')} />
            {/* The card's own fields sit under the methods, as in the file's hidden layer. */}
            <Expand open={byCard}>
              <div className="flex flex-col gap-4 pt-4">
                {text('number', 'Card number', 'Enter your card number', 'numeric')}
                {text('expiry', 'Expiry date', 'MM/YY', 'numeric')}
                {text('cvc', 'CVC', '***', 'numeric')}
              </div>
            </Expand>
          </div>
        </Panel>

        <Expand open={byCard}>
            <div className="pt-5">
              <Panel dense labelledBy={`${ids}-billing`}>
                <h3 id={`${ids}-billing`} className="mf-trim text-[20px] leading-[1.3] font-semibold tracking-[0.04px] whitespace-nowrap text-(--mf-text)">Billing details</h3>
                <div className="flex flex-col gap-4">
                  {text('first', 'First name', 'Enter your first name')}
                  {text('last', 'Last name', 'Enter your last name')}
                  <div className="flex flex-col gap-2">
                    <FieldLabel>Country</FieldLabel>
                    <CountrySelect value={pay.billing} onChange={pay.setBilling} muted={!pay.billingPicked}
                      className="w-full" fieldClassName="mf-field focus-visible:border-(--mf-text-secondary)" />
                  </div>
                  {text('address', 'Address line 1', 'Enter your address')}
                  {text('address2', 'Address line 2', 'Enter your address')}
                  {text('postcode', 'Postcode', 'Enter your postcode')}
                  <CityAutocomplete id={fieldId('city')} label="City" cities={pay.billingCities} value={card.city}
                    onChange={v => pay.setCardField('city', v)} onBlur={() => blur('city')} error={errorFor('city')} />
                  {text('phone', 'Phone number', 'Enter your phone number', 'tel')}
                </div>
              </Panel>
            </div>
        </Expand>
        </div>
      </div>

      <Actions>
        <SecondaryButton onClick={onCancel} className="min-w-0 flex-1">Cancel</SecondaryButton>
        <PrimaryButton onClick={donate} incomplete={!pay.valid} busy={pay.status === 'sending'} className="min-w-0 flex-1 px-[38px]">Next</PrimaryButton>
      </Actions>
    </>
  )
}

function SummaryStep({ pay, focusRef, onHome }: StepProps & { onHome: () => void }) {
  const { target, receipt } = pay
  const row = (label: string, value: ReactNode) => (
    <div className="flex w-full items-center justify-between text-[18px] leading-[1.45] whitespace-nowrap text-(--mf-text)">
      <span className="mf-trim mf-ff">{label}</span>
      <span className="mf-trim mf-ff font-medium">{value}</span>
    </div>
  )
  return (
    <>
      <div className="flex items-start gap-4">
        <BackArrow onClick={onHome} />
        <Stepper at={2} focusRef={focusRef} />
      </div>

      <div className="flex flex-col gap-6">
        <Panel dense className="items-center">
          <m.span className="flex" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22, delay: 0.2 }}>
            <Svg src="success-check.svg" width={32} height={32} />
          </m.span>
          <TargetChip target={target} />
          <div className="flex w-full flex-col items-center gap-4 leading-[1.3] text-(--mf-text)">
            <h2 className="mf-trim w-full text-center text-[18px] font-semibold tracking-[0.036px]">Confirmation Your Weekly total is</h2>
            <p className="mf-trim text-[24px] font-bold tracking-[0.048px] whitespace-nowrap">{money(pay.total, pay.currency)}</p>
          </div>
          {row('Location', receipt.city)}
          {row('Start date', receipt.start)}
          {row('Payment method', <MethodMark method={pay.method} last4={receipt.last4} />)}
          <p className="mf-trim w-full text-center text-[20px] leading-[30px] font-medium tracking-[0.04px] text-(--mf-text)">Thank you !</p>
        </Panel>

        <Panel dense className="items-center">
          <p className="mf-trim text-center text-[18px] leading-[1.45] text-(--mf-text) italic [font-feature-settings:'ss05'_1,'ss01'_1]">
            &quot;And whatever you spend in the way of Allah, it will be repaid to you in full, and you will not be wronged.&quot;
          </p>
          <p className="mf-trim text-center text-[20px] leading-[1.3] font-semibold tracking-[0.04px] whitespace-nowrap text-(--mf-blue-light-500)">(Quran 2:272)</p>
        </Panel>
      </div>

      <PrimaryButton onClick={onHome} className="w-full px-[78px]">Go back to home page</PrimaryButton>
    </>
  )
}

// ── Screen ───────────────────────────────────────────────────────────

interface PaymentMobileProps {
  pay: Checkout
  onBack: () => void
  onCancel: () => void
  onHome: () => void
}

export function PaymentMobile({ pay, onBack, onCancel, onHome }: PaymentMobileProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const focusRef = useRef<HTMLOListElement>(null)
  const screen: Screen = pay.status === 'done' ? 'summary' : pay.step
  const [dir, setDir] = useState(1)
  const first = useRef(true)

  // Each step starts at the top, with focus on its progress bar (not on the first mount: that's Donate's job).
  useEffect(() => {
    if (first.current) { first.current = false; return }
    focusRef.current?.focus({ preventScroll: true })
  }, [screen])

  const go = (step: 'info' | 'pay', direction: number) => { setDir(direction); pay.setStep(step) }

  return (
    <div className="mf-light absolute inset-0 flex flex-col">
      <StatusBar tone="light" />
      <Header links={NAV[pay.target.kind]} />

      <div className="relative min-h-0 flex-1">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <m.div key={screen} ref={scrollRef} custom={dir} variants={SLIDE} initial="enter" animate="center" exit="exit"
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="absolute inset-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex flex-col gap-8 px-5 py-6">
              {screen === 'info' && <InfoStep pay={pay} scrollRef={scrollRef} focusRef={focusRef} onBack={onBack} onCancel={onCancel} onNext={() => go('pay', 1)} />}
              {screen === 'pay' && <PayStep pay={pay} scrollRef={scrollRef} focusRef={focusRef} onBack={() => go('info', -1)} onCancel={onCancel} />}
              {screen === 'summary' && <SummaryStep pay={pay} scrollRef={scrollRef} focusRef={focusRef} onHome={onHome} />}
            </div>
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
