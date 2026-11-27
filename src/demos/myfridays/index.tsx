'use client'

import { useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { Work_Sans } from 'next/font/google'
import type { DemoDevice, DemoProps } from '../catalog'
import './tokens.css'
import { useCheckout } from './checkout'
import { Home } from './Home'
import { HomeMobile } from './HomeMobile'
import { useLanding, type DonationTarget } from './landing'
import { Payment } from './Payment'
import { PaymentMobile } from './PaymentMobile'
import { Receipt } from './Receipt'

// MyFridays donor flow, web and mobile (Figma file MyFridays › ↳ Donor 💸
// and Payment), built step by step:
//
//   Home ─ Donate → Payment ─ Donate → Receipt ─ Go back to home page → Home
//
// On the phone, Payment is three steps: Info → Payment → Summary (the receipt).

// Work Sans is the file's display and body font (weights 300–700 in use,
// and its italic for the receipt's verse).
const workSans = Work_Sans({ subsets: ['latin'], style: ['normal', 'italic'], display: 'swap' })

const SLIDE = {
  enter: (dir: number) => ({ x: dir * 48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -48, opacity: 0 }),
}
const SLIDE_SPRING = { type: 'spring', stiffness: 380, damping: 38 } as const

interface CheckoutFlowProps {
  device: DemoDevice
  target: DonationTarget
  onBack: () => void
  onCancel: () => void
  onHome: () => void
}

/**
 * Payment, then the receipt. Its state starts fresh for each donation and
 * sits above both layouts, so switching Web ↔ Mobile keeps what you filled in.
 */
function CheckoutFlow({ device, target, onBack, onCancel, onHome }: CheckoutFlowProps) {
  const pay = useCheckout(target)
  const done = pay.status === 'done'
  if (device === 'phone') return <PaymentMobile pay={pay} onBack={onBack} onCancel={onCancel} onHome={onHome} />
  return (
    <AnimatePresence initial={false} custom={1} mode="popLayout">
      <m.div key={done ? 'receipt' : 'payment'} className="absolute inset-0" custom={1}
        variants={SLIDE} initial="enter" animate="center" exit="exit" transition={SLIDE_SPRING}>
        {done ? <Receipt pay={pay} onHome={onHome} /> : <Payment pay={pay} onBack={onBack} onCancel={onCancel} />}
      </m.div>
    </AnimatePresence>
  )
}

export default function MyFridaysDemo({ device }: DemoProps) {
  // One landing state under both layouts, so switching Web ↔ Mobile keeps
  // your tab, search, country, pick and amount.
  const [flow, setFlow] = useState<{ id: number; target: DonationTarget } | null>(null)
  const [dir, setDir] = useState(1)
  const landing = useLanding(target => {
    setDir(1)
    setFlow(f => ({ id: (f?.id ?? 0) + 1, target }))
  })
  // Back keeps your card open on the landing; Cancel and the receipt close it.
  const back = () => { setDir(-1); setFlow(null) }
  const home = () => { setDir(-1); setFlow(null); landing.clearPick() }

  return (
    <div className={`mf demo-scope ${workSans.className} absolute inset-0 overflow-hidden`}>
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <m.div key={flow ? `checkout-${flow.id}` : 'home'} className="absolute inset-0" custom={dir}
          variants={SLIDE} initial="enter" animate="center" exit="exit" transition={SLIDE_SPRING}>
          {flow
            ? <CheckoutFlow device={device} target={flow.target} onBack={back} onCancel={home} onHome={home} />
            : device === 'phone' ? <HomeMobile landing={landing} /> : <Home landing={landing} />}
        </m.div>
      </AnimatePresence>
    </div>
  )
}
