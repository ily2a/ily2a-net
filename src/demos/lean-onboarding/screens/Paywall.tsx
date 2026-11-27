'use client'

import { useState } from 'react'
import Image from 'next/image'
import { asset, PrimaryButton, Radio, Screen, Tag } from '../ui'

// Paywall (sign-up path) and Paywall sale (returning users from Login).
// Same layout; the sale variant shows struck-through prices and Save tags.

type PlanId = 'annual' | 'quarterly' | 'monthly'

interface Plan {
  id: PlanId
  label: string
  perMonth?: string
  price: string
  was?: string
  period: string
  note?: string
  tag: string
  tagTone: 'sale' | 'secondary'
}

const REGULAR: Plan[] = [
  { id: 'annual', label: 'Annual', perMonth: '€10.00 per month', price: '€119.99', period: 'per year', note: 'Save 33% vs monthly', tag: 'Best value', tagTone: 'sale' },
  { id: 'quarterly', label: 'Quarterly', perMonth: '€13.00 per month', price: '€38.99', period: 'every 3 months', note: 'Save 23% vs monthly', tag: '', tagTone: 'sale' },
  { id: 'monthly', label: 'Monthly', price: '€16.99', period: 'per month', tag: 'Most popular', tagTone: 'secondary' },
]

const SALE: Plan[] = [
  { id: 'annual', label: 'Annual', perMonth: '€10.00 per month', was: '€150.99', price: '€119.99', period: 'billed yearly', tag: 'Save 33%', tagTone: 'sale' },
  { id: 'quarterly', label: 'Quarterly', perMonth: '€13.00 per month', was: '€58.99', price: '€38.99', period: 'billed quarterly', tag: 'Save 20%', tagTone: 'sale' },
  { id: 'monthly', label: 'Monthly', was: '€16.99', price: '€14.00', period: 'billed monthly', tag: 'Save 18%', tagTone: 'sale' },
]

function PlanCard({ plan, sale, checked, onSelect }: { plan: Plan; sale: boolean; checked: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className="relative flex min-h-[74px] w-full items-center justify-between rounded-[4px] bg-(--lean-card-bg-2) p-3 text-left"
    >
      <span className="flex flex-col items-start gap-2">
        <span className="flex items-center gap-2">
          <Radio checked={checked} />
          <span className="text-[16px] leading-6 font-semibold text-(--lean-text-primary)">{plan.label}</span>
        </span>
        {plan.perMonth && <span className="text-[12px] leading-[18px] text-(--lean-text-secondary)">{plan.perMonth}</span>}
      </span>

      {sale ? (
        <span className="flex flex-col items-end whitespace-nowrap">
          <span className="flex items-center gap-2">
            <s className="text-[12px] leading-[18px] font-medium text-(--lean-text-muted)">{plan.was}</s>
            <span className="text-[16px] leading-6 font-bold text-(--lean-text-primary)">{plan.price}</span>
          </span>
          <span className="text-[12px] leading-[18px] text-(--lean-text-primary)">{plan.period}</span>
        </span>
      ) : (
        <span className="flex flex-col items-end whitespace-nowrap">
          <span className="flex items-center gap-1.5 text-(--lean-text-primary)">
            <span className="text-[16px] leading-6 font-bold">{plan.price}</span>
            <span className="text-[14px] leading-5">{plan.period}</span>
          </span>
          {plan.note && <span className="text-[12px] leading-[18px] text-(--lean-text-secondary)">{plan.note}</span>}
        </span>
      )}

      {plan.tag && <Tag tone={plan.tagTone} className="absolute -top-3 right-3">{plan.tag}</Tag>}
    </button>
  )
}

export function Paywall({ sale = false, onContinue }: { sale?: boolean; onContinue: () => void }) {
  const [plan, setPlan] = useState<PlanId>('annual')
  const plans = sale ? SALE : REGULAR

  return (
    <Screen footer={<PrimaryButton onClick={onContinue}>Get started</PrimaryButton>}>
      <div className="mt-3 flex flex-col gap-4">
        <h2 className="text-center text-[20px] leading-[30px] font-bold text-(--lean-text-secondary)">Start LEAN &amp; get results that last</h2>
        <div className="flex flex-col items-center gap-2">
          <figure className="relative flex h-[232px] w-full flex-col justify-end overflow-hidden rounded-[2px] p-4">
            <Image src={asset('paywall-1.png')} alt="Before and after results from a LEAN member" fill sizes="343px" className="object-cover" />
            <figcaption className="relative flex items-center justify-center rounded-[2px] border border-(--lean-border-default) bg-(--lean-bg-subtle) px-3 py-2 text-[16px] leading-6 font-semibold text-(--lean-text-secondary)">
              User name, 22, Profession
            </figcaption>
          </figure>
          <div aria-hidden className="flex items-center gap-2">
            <span className="h-1 w-4 rounded-full bg-(--lean-tag-secondary)" />
            <span className="h-1 w-3 rounded-full bg-(--lean-tag-primary)" />
            <span className="h-1 w-3 rounded-full bg-(--lean-tag-primary)" />
            <span className="h-1 w-3 rounded-full bg-(--lean-tag-primary)" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-6">
          <p id="lean-plans" className="text-center text-[16px] leading-6 font-medium text-(--lean-text-primary)">Begin your LEAN transformation today.</p>
          <div role="radiogroup" aria-labelledby="lean-plans" className="flex w-full flex-col gap-4">
            {plans.map(p => (
              <PlanCard key={p.id} plan={p} sale={sale} checked={plan === p.id} onSelect={() => setPlan(p.id)} />
            ))}
          </div>
        </div>
      </div>
    </Screen>
  )
}
