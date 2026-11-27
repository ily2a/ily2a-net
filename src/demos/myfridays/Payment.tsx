'use client'

import { useEffect, useId, useRef } from 'react'
import type { CardField, Checkout } from './checkout'
import {
  BackLink, Checkbox, CityAutocomplete, CityField, Expand, FieldLabel, Panel, PanelHead, PaymentMethods, PrimaryButton,
  SecondaryButton, SplitPanel, SummaryRows, TargetChip, TextField, TimeTabs, WeeklyTotal,
} from './checkout-ui'
import { CountrySelect } from './CountrySelect'
import { Select } from './Select'
import { TopNav } from './Home'

// MyFridays Payment on web (Figma: Payment › "Payment without card", "Payment
// with card", and "Donation to specific charity" for a charity, which adds
// the donation split). Light, like the file. Picking Card opens the card
// form; Donate shows what's missing, or sends it and opens the receipt.

/** Focuses a field without jumping the case study, scrolling the page inside the frame instead. */
export function focusField(id: string, scroller: HTMLElement | null) {
  const el = document.getElementById(id)
  if (!el) return
  el.focus({ preventScroll: true })
  if (!scroller) return
  let top = 0
  for (let node: HTMLElement | null = el; node && node !== scroller; node = node.offsetParent as HTMLElement | null) top += node.offsetTop
  const margin = 120
  if (top - margin >= scroller.scrollTop && top + el.offsetHeight + margin <= scroller.scrollTop + scroller.clientHeight) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  scroller.scrollTo({ top: Math.max(0, top - margin), behavior: reduce ? 'auto' : 'smooth' })
}

const NAV = {
  cause: ['Blog', 'My Donations', 'Log Out'],
  charity: ['Blog', 'Causes', 'My Donations', 'Log Out'],
} as const

interface PaymentProps {
  pay: Checkout
  onBack: () => void
  onCancel: () => void
}

export function Payment({ pay, onBack, onCancel }: PaymentProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const ids = useId()
  const { target, card, fieldId, errorFor, blur } = pay
  const charity = target.kind === 'charity'

  // Donate on the landing unmounts with it, so focus starts on this page's heading.
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }) }, [])

  const donate = () => {
    const first = pay.submit()
    if (first) focusField(fieldId(first), scrollRef.current)
  }

  const text = (field: CardField, label: string, placeholder: string, extra: { inputMode?: 'numeric' | 'tel'; className?: string } = {}) => (
    <TextField id={fieldId(field)} label={label} placeholder={placeholder} value={card[field]}
      onChange={v => pay.setCardField(field, v)} onBlur={() => blur(field)} error={errorFor(field)} {...extra} />
  )

  return (
    <div className="mf-light absolute inset-0 flex flex-col">
      <TopNav links={NAV[target.kind]} />

      <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <main className="mx-auto flex w-[1280px] flex-col gap-8 pt-[60px] pb-16">
          <div className="flex items-center gap-6">
            <BackLink onClick={onBack} />
            <h2 ref={headingRef} tabIndex={-1} className="flex items-center gap-2 rounded-md outline-none">
              <span className="mf-trim text-[30px] leading-[1.3] font-bold tracking-[0.06px] whitespace-nowrap text-(--mf-text)">Donate to</span>
              <TargetChip target={target} />
            </h2>
          </div>

          <div className="flex items-start gap-5">
            <div className="flex min-w-0 flex-1 flex-col gap-5">
              <Panel labelledBy={`${ids}-where`}>
                <PanelHead id={`${ids}-where`} title="Where do you live ?">
                  It will help us notify you when Maghreb prayer hours arrives at your exact location
                </PanelHead>
                <CityField id={fieldId('location')} labelledBy={`${ids}-where`} cities={pay.cities}
                  value={pay.location} onChange={pay.setLocation} onBlur={() => blur('location')} error={errorFor('location')} />
              </Panel>

              <Panel labelledBy={`${ids}-time`}>
                {/* The file keeps the tabs 16px under the title, inside the title's group. */}
                <div className="flex flex-col gap-4">
                  <PanelHead id={`${ids}-time`} title="At what time do you want to donate ?" />
                  <TimeTabs value={pay.time} onChange={pay.setTime} labelledBy={`${ids}-time`} />
                </div>
              </Panel>

              {pay.giftAidApplies && (
                <Panel labelledBy={`${ids}-gift`}>
                  <PanelHead id={`${ids}-gift`} title="Gift aid">
                    By selecting yes, I declare that I am a UK taxpayer and it will increase your donation for free read more
                  </PanelHead>
                  <Checkbox checked={pay.giftAid} onChange={pay.setGiftAid} label="Yes, I’d like to include GiftAid" />
                </Panel>
              )}

              <Panel labelledBy={`${ids}-tips`}>
                <PanelHead id={`${ids}-tips`} title="Your tips keep us going">
                  Tips are taken along with your first payment.
                </PanelHead>
                <Select label="Tip" options={pay.tipOptions} value={String(pay.tipRate)} onChange={id => pay.pickTip(Number(id))}
                  muted={!pay.tipPicked} up className="w-full" fieldClassName="mf-field focus-visible:border-(--mf-text-secondary)" />
              </Panel>
            </div>

            <div className="flex w-[640px] shrink-0 flex-col gap-5">
              <Panel labelledBy={`${ids}-total`}>
                <div id={`${ids}-total`}><WeeklyTotal total={pay.total} currency={pay.currency} /></div>
                <SummaryRows pay={pay} />
                <div className="flex flex-col">
                  <PaymentMethods id={fieldId('method')} value={pay.method} onChange={pay.setMethod} error={errorFor('method')} />
                  <Expand open={pay.method === 'card'}>
                    <div className="flex flex-col gap-4 pt-5">
                      <div className="flex flex-col gap-3">
                        {text('number', 'Card number', 'Enter your card number', { inputMode: 'numeric' })}
                        {text('expiry', 'Expiry date', 'MM/YY', { inputMode: 'numeric' })}
                        {text('cvc', 'CVC', '***', { inputMode: 'numeric' })}
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                          {text('first', 'First name', 'Enter your first name', { className: 'flex-1' })}
                          {text('last', 'Last name', 'Enter your last name', { className: 'flex-1' })}
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="flex w-[220px] shrink-0 flex-col gap-2">
                            <FieldLabel>Country</FieldLabel>
                            <CountrySelect value={pay.billing} onChange={pay.setBilling} muted={!pay.billingPicked}
                              className="w-full" fieldClassName="mf-field focus-visible:border-(--mf-text-secondary)" />
                          </div>
                          {text('address', 'Address line', 'Enter your address', { className: 'flex-1' })}
                        </div>
                        <div className="flex items-start gap-3">
                          <CityAutocomplete id={fieldId('city')} label="City" cities={pay.billingCities} value={card.city}
                            onChange={v => pay.setCardField('city', v)} onBlur={() => blur('city')} error={errorFor('city')} className="w-[160px] shrink-0" />
                          {text('postcode', 'Postcode', 'Enter your postcode', { className: 'w-[160px] shrink-0' })}
                          {text('phone', 'Phone number', 'Enter your phone number', { inputMode: 'tel', className: 'flex-1' })}
                        </div>
                      </div>
                    </div>
                  </Expand>
                </div>
              </Panel>

              {charity && <SplitPanel pay={pay} id={fieldId('split')} />}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
            <PrimaryButton onClick={donate} incomplete={!pay.valid} busy={pay.status === 'sending'}>Donate</PrimaryButton>
          </div>
        </main>
      </div>
    </div>
  )
}
