'use client'

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { Urbanist } from 'next/font/google'
import { CauseIcon, CharityLogo, MenuIcon, Svg } from './assets'
import { CountrySelect } from './CountrySelect'
import { MOBILE_CAUSE_ORDER } from './data'
import { AmountRow, Countdown, Reveal, REVEAL_SPRING, SearchField, Tabs, TITLE, type Landing, type Pick } from './landing'

// MyFridays landing on mobile (Figma: Donor › the two 393×852 "landing"
// frames, Causes and Charities). Same state as the web layout. The status
// bar and logo bar stay put and the rest scrolls. Cards open like an
// accordion, one at a time.

// The file sets the status bar clock in Urbanist SemiBold.
const urbanist = Urbanist({ subsets: ['latin'], weight: '600', display: 'swap' })

const SPRING = { type: 'spring', stiffness: 400, damping: 30 } as const

/** The phone's status bar: white on the dark landing, dark on Payment's light screens. */
export function StatusBar({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const light = tone === 'light'
  return (
    <div aria-hidden className="flex h-[54px] shrink-0 items-center justify-between px-5">
      <span className={`${urbanist.className} mf-trim text-[16px] leading-[1.3] font-semibold tracking-[0.08px] ${light ? 'text-(--mf-gray-900)' : 'text-(--mf-white)'}`}>9:41</span>
      <Svg src={light ? 'm-status-icons-dark.svg' : 'm-status-icons.svg'} width={77.328} height={13} className="-mr-[0.328px]" />
    </div>
  )
}

/** Logo bar. The burger opens the nav's links in a panel under it. */
export function Header({ links = ['Blog', 'My Donations'] }: { links?: readonly string[] }) {
  const [open, setOpen] = useState(false)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <header className="relative z-30 flex h-14 shrink-0 items-center justify-between bg-(--mf-gray-800) px-4 pt-4 pb-[19px]">
        {/* The padding grows the tap target to 44px without moving the icon. */}
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen(o => !o)}
          className="-m-2.5 flex rounded-md p-2.5"
        >
          <MenuIcon />
        </button>
        <span role="img" aria-label="MyFridays"><Svg src="m-logo.svg" width={168.391} height={19.569} /></span>
      </header>

      <AnimatePresence>
        {open && (
          <m.div
            key="scrim"
            aria-hidden
            onClick={() => setOpen(false)}
            className="absolute inset-x-0 top-[110px] bottom-0 z-20 bg-(--mf-bg-primary)/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
        {open && (
          <m.nav
            key="menu"
            id={menuId}
            aria-label="Main"
            className="mf-ff absolute inset-x-0 top-[110px] z-20 flex flex-col bg-(--mf-gray-800) px-4 pb-2 text-[18px] leading-[1.45] font-medium text-(--mf-white)"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {links.map((link, i) => (
              <span key={link} className={`py-3 ${i ? 'border-t border-(--mf-border)' : ''}`}>{link}</span>
            ))}
          </m.nav>
        )}
      </AnimatePresence>
    </>
  )
}

/** Scrolls the phone's page (not the case study around it) so an opened card is fully in view. */
function bringIntoView(card: HTMLElement, scroller: HTMLElement) {
  let top = 0
  for (let el: HTMLElement | null = card; el && el !== scroller; el = el.offsetParent as HTMLElement | null) top += el.offsetTop
  const margin = 16
  const bottom = top + card.offsetHeight + margin
  if (bottom <= scroller.scrollTop + scroller.clientHeight) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  scroller.scrollTo({ top: Math.min(bottom - scroller.clientHeight, top - margin), behavior: reduce ? 'auto' : 'smooth' })
}

// Body copy: 16px Work Sans at 1.45 line height.
const LINE = 16 * 1.45
const DESCRIPTION = { open: { height: 'auto' }, closed: { height: 2 * LINE } }

/** Two lines with an ellipsis while the card is closed, all of it once it's open. */
function Description({ open, text }: { open: boolean; text: string }) {
  // The ellipsis comes back once the card has folded, so the extra lines
  // slide away under the edge rather than vanishing first.
  const [folded, setFolded] = useState(!open)
  return (
    <m.div
      // Whole line boxes, so the clip never cuts ascenders or descenders,
      // pulled in by half the line gap to sit like the file's trimmed text.
      className="-my-[calc((1lh-1cap)/2)] overflow-hidden text-[16px] leading-[1.45]"
      variants={DESCRIPTION}
      initial={false}
      animate={open ? 'open' : 'closed'}
      transition={REVEAL_SPRING}
      onAnimationComplete={name => setFolded(name === 'closed')}
    >
      <p className={`mf-ff-body text-(--mf-text) ${!open && folded ? 'line-clamp-2' : ''}`}>{text}</p>
    </m.div>
  )
}

interface AccordionCardProps {
  open: boolean
  onOpen: () => void
  onClose: () => void
  header: ReactNode
  description: string
  amountRow: ReactNode
  scrollRef: RefObject<HTMLDivElement | null>
}

/**
 * A cause or charity card. Tap a closed card anywhere to open it; the title
 * row is the keyboard control and folds the open card away again. No hover
 * state: it's a phone layout.
 */
function AccordionCard({ open, onOpen, onClose, header, description, amountRow, scrollRef }: AccordionCardProps) {
  const id = useId()
  const cardRef = useRef<HTMLDivElement>(null)
  // Set when you open the card, so it scrolls into full view once it has
  // grown. A card that's already open when the layout appears stays put.
  const opening = useRef(false)
  const openCard = () => {
    opening.current = true
    onOpen()
  }
  const onOpened = () => {
    if (!opening.current) return
    opening.current = false
    if (cardRef.current && scrollRef.current) bringIntoView(cardRef.current, scrollRef.current)
  }

  return (
    <m.div
      ref={cardRef}
      onClick={open ? undefined : openCard}
      whileTap={open ? undefined : { scale: 0.99 }}
      transition={SPRING}
      className={`mf-card-shadow flex flex-col rounded-lg border p-5 transition-colors duration-200 ${
        open
          ? 'border-(--mf-logo-orange) bg-(--mf-bg-secondary)'
          : 'cursor-pointer border-(--mf-border) bg-(--mf-bg-primary) has-[:focus-visible]:border-(--mf-logo-orange)'
      }`}
    >
      <div className="flex flex-col gap-4">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={e => {
            e.stopPropagation()
            if (open) onClose()
            else openCard()
          }}
          className="flex w-full items-center justify-between gap-2 text-left"
        >
          <span className="flex min-w-0 items-center gap-2">{header}</span>
          <m.span aria-hidden className="flex shrink-0" initial={false} animate={{ rotate: open ? 180 : 0 }} transition={SPRING}>
            <Svg src="m-chevron-down.svg" width={24} height={24} />
          </m.span>
        </button>
        <Description open={open} text={description} />
      </div>
      <Reveal open={open} id={id} onOpened={onOpened}>{amountRow}</Reveal>
    </m.div>
  )
}

// ── Screen ───────────────────────────────────────────────────────────

export function HomeMobile({ landing }: { landing: Landing }) {
  const {
    tab, setTab, query, onSearch, cause, setCause, charity, setCharity,
    amount, setAmount, country, setCountry, causes, charities, counts, empty, donate,
  } = landing
  const scrollRef = useRef<HTMLDivElement>(null)
  const mobileCauses = [...causes].sort((a, b) => MOBILE_CAUSE_ORDER.indexOf(a.id) - MOBILE_CAUSE_ORDER.indexOf(b.id))

  const amountRow = (pick: Pick, name: string) => (
    <AmountRow label={name} currency={country.currency} amount={amount} onAmount={setAmount} onDonate={() => donate(pick)} fieldWidth="w-[216px]" />
  )

  return (
    <div className="absolute inset-0 flex flex-col bg-(--mf-gray-900)">
      <StatusBar />
      <Header />

      <div ref={scrollRef} className="relative isolate min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col items-center gap-3 bg-(--mf-bg-primary) px-5 py-3 whitespace-nowrap">
          <p className="mf-trim mf-ff-body text-[12px] leading-[1.45] text-(--mf-white)">Set up your donations ahead of Jumu’ah</p>
          <Countdown className="mf-trim text-[16px] leading-[1.3] font-semibold tracking-[0.032px] text-(--mf-warning-200) [&>*+*]:ms-2" />
        </div>

        <main className="flex flex-col gap-6 px-5 py-8">
          <div className="flex flex-col items-center gap-5">
            <span role="img" aria-label="MyFridays"><Svg src="logo-hero.svg" width={275.361} height={32} /></span>
            <div className="flex flex-col items-center gap-3 whitespace-nowrap text-(--mf-white)">
              <h2 className="mf-trim text-[24px] leading-[1.3] font-medium tracking-[0.048px]">
                {tab === 'causes' ? 'Pick a cause To support' : 'Pick a charity To support'}
              </h2>
              <p className="mf-trim mf-ff text-[16px] leading-[1.45] font-light">All Donations are tax-deductible</p>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <CountrySelect value={country} onChange={setCountry} className="w-full" />
              <SearchField query={query} onSearch={onSearch} className="w-full" />
              <Tabs tab={tab} onChange={setTab} counts={counts} />
            </div>

            <div role="tabpanel" aria-label={tab === 'causes' ? 'Causes' : 'Charities'} className="flex flex-col gap-4">
              {tab === 'causes'
                ? mobileCauses.map(c => (
                    <AccordionCard
                      key={c.id}
                      scrollRef={scrollRef}
                      open={cause === c.id}
                      onOpen={() => setCause(c.id)}
                      onClose={() => setCause(null)}
                      header={<><CauseIcon name={c.id} /><span className={TITLE}>{c.name}</span></>}
                      description={c.description}
                      amountRow={amountRow({ kind: 'cause', cause: c }, c.name)}
                    />
                  ))
                : charities.map(c => (
                    <AccordionCard
                      key={c.id}
                      scrollRef={scrollRef}
                      open={charity === c.id}
                      onOpen={() => setCharity(c.id)}
                      onClose={() => setCharity(null)}
                      header={<><CharityLogo logo={c.logo} /><span className={TITLE}>{c.name}</span></>}
                      description={c.description}
                      amountRow={amountRow({ kind: 'charity', charity: c }, c.name)}
                    />
                  ))}
              {empty && (
                <p className="py-16 text-center text-[16px] leading-[1.45] break-words whitespace-normal text-(--mf-text-subtle)">
                  Nothing matches “{query.trim()}”.
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
