'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { m } from 'motion/react'
import { Svg } from './assets'
import { money, type Checkout } from './checkout'
import { BackLink, MethodMark, Panel, PrimaryButton, TargetChip } from './checkout-ui'
import { TopNav } from './Home'

// MyFridays receipt on web (Figma: Payment › "Payment recipt"): what you
// set up, when it starts, and how you paid. Back and the button both go
// home; the donation is done.

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex w-full items-center justify-between text-[18px] leading-[1.45] whitespace-nowrap text-(--mf-text)">
      <span className="mf-trim mf-ff">{label}</span>
      <span className="mf-trim mf-ff font-medium">{children}</span>
    </div>
  )
}

export function Receipt({ pay, onHome }: { pay: Checkout; onHome: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const { target, receipt } = pay

  useEffect(() => { headingRef.current?.focus({ preventScroll: true }) }, [])

  return (
    <div className="mf-light absolute inset-0 flex flex-col">
      <TopNav links={target.kind === 'charity' ? ['Blog', 'Causes', 'My Donations', 'Log Out'] : ['Blog', 'My Donations', 'Log Out']} />

      <div className="relative min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <main className="mx-auto flex w-[1280px] flex-col items-center gap-8 pt-[60px] pb-16">
          <div className="flex w-full items-center">
            <BackLink onClick={onHome} />
          </div>

          <div className="flex w-[526px] flex-col gap-6">
            <Panel className="items-center">
              <m.span className="flex" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 22, delay: 0.15 }}>
                <Svg src="success-check.svg" width={32} height={32} />
              </m.span>
              <TargetChip target={target} />
              <div className="flex flex-col items-center gap-4 leading-[1.3] whitespace-nowrap text-(--mf-text)">
                <h2 ref={headingRef} tabIndex={-1} className="mf-trim text-center text-[20px] font-semibold tracking-[0.04px] outline-none">
                  Confirmation Your Weekly total is
                </h2>
                <p className="mf-trim text-[24px] font-bold tracking-[0.048px]">{money(pay.total, pay.currency)}</p>
              </div>
              <Row label="Location">{receipt.city}</Row>
              <Row label="Start date">{receipt.start}</Row>
              <Row label="Payment method"><MethodMark method={pay.method} last4={receipt.last4} /></Row>
              <p className="mf-trim w-full text-center text-[20px] leading-[30px] font-medium tracking-[0.04px] text-(--mf-text)">Thank you !</p>
            </Panel>

            <Panel className="items-center">
              <p className="mf-trim text-center text-[18px] leading-[1.45] text-(--mf-text) italic [font-feature-settings:'ss05'_1,'ss01'_1]">
                &quot;And whatever you spend in the way of Allah, it will be repaid to you in full, and you will not be wronged.&quot;
              </p>
              <p className="mf-trim text-center text-[20px] leading-[1.3] font-semibold tracking-[0.04px] whitespace-nowrap text-(--mf-blue-light-500)">(Quran 2:272)</p>
            </Panel>
          </div>

          <PrimaryButton onClick={onHome} className="px-[78px]">Go back to home page</PrimaryButton>
        </main>
      </div>
    </div>
  )
}
