'use client'

import { useId, type ReactNode } from 'react'
import { m } from 'motion/react'
import { CauseIcon, CharityLogo, Svg } from './assets'
import { CountrySelect } from './CountrySelect'
import { AmountRow, BODY, Countdown, Reveal, SearchField, Tabs, TITLE, type Landing } from './landing'

// MyFridays landing on web (Figma: Donor › Landing, the two 1440×1024
// "landing" frames). Causes / Charities tabs, live search, and a selectable
// card that opens the weekly amount + Donate row, exactly as the selected
// card in the file. Colours and type are the file's own.

/** The web nav bar. Each frame lists its own links (Payment adds Log Out). */
export function TopNav({ links = ['Blog', 'My Donations'] }: { links?: readonly string[] }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between bg-(--mf-gray-800) px-20 py-2">
      <span role="img" aria-label="MyFridays"><Svg src="logo-nav.svg" width={168.391} height={19.569} /></span>
      <nav aria-label="Main" className="mf-ff flex items-center gap-8 text-center text-[18px] leading-[1.45] font-medium whitespace-nowrap text-(--mf-white)">
        {links.map(link => <span key={link} className="mf-trim">{link}</span>)}
      </nav>
    </header>
  )
}

function CountdownBar() {
  return (
    <div className="flex h-16 items-center justify-center gap-10 bg-(--mf-bg-primary) py-3 leading-[1.3] whitespace-nowrap">
      <p className="mf-trim text-[20px] font-semibold tracking-[0.04px] text-(--mf-white)">Set up your donations ahead of Jumu’ah</p>
      <Countdown className="flex items-center gap-2 rounded-lg p-4 text-[16px] font-bold tracking-[0.032px] text-(--mf-yellow-200)" />
    </div>
  )
}

interface CardProps {
  selected: boolean
  onSelect: () => void
  minHeight: string
  header: ReactNode
  description: ReactNode
  amountRow: ReactNode
  label: string
}

/** A cause or charity card. Click anywhere to select it; the title is the keyboard control. */
function Card({ selected, onSelect, minHeight, header, description, amountRow, label }: CardProps) {
  const id = useId()
  return (
    <m.div
      onClick={onSelect}
      whileHover={selected ? undefined : { y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`mf-card-shadow relative flex cursor-pointer flex-col justify-center rounded-lg border p-5 transition-colors duration-200 ${minHeight} ${
        selected
          ? 'border-(--mf-logo-orange) bg-(--mf-bg-secondary)'
          : 'border-(--mf-border) bg-(--mf-bg-primary) hover:border-(--mf-logo-orange) focus-within:border-(--mf-logo-orange)'
      }`}
    >
      <div className="flex flex-col gap-4">
        <button
          type="button"
          aria-expanded={selected}
          aria-controls={id}
          aria-label={`${label}${selected ? '' : ', choose to set a weekly amount'}`}
          onClick={e => { e.stopPropagation(); onSelect() }}
          className="flex w-full items-center gap-2 text-left"
        >
          {header}
        </button>
        {description}
      </div>
      <Reveal open={selected} id={id}>{amountRow}</Reveal>
    </m.div>
  )
}

// ── Screen ───────────────────────────────────────────────────────────

export function Home({ landing }: { landing: Landing }) {
  const {
    tab, setTab, query, onSearch, cause, setCause, charity, setCharity,
    amount, setAmount, country, setCountry, causes, charities, counts, empty, donate,
  } = landing

  return (
    <div className="relative h-full w-full overflow-hidden bg-(--mf-gray-900)">
      <TopNav />
      <CountdownBar />

      <main className="mx-auto mt-8 flex w-[1280px] flex-col gap-8">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-5">
              <span role="img" aria-label="MyFridays"><Svg src="logo-hero.svg" width={275.361} height={32} /></span>
              <div className="flex items-end gap-5 whitespace-nowrap">
                <h2 className="mf-trim text-[24px] leading-[1.3] font-semibold tracking-[0.048px] text-(--mf-white)">
                  {tab === 'causes' ? 'Pick a cause To support' : 'Pick a charity To support'}
                </h2>
                <p className="mf-trim mf-ff-body text-[18px] leading-[1.45] font-light text-(--mf-text-subtle)">All Donations are tax-deductible</p>
              </div>
            </div>
            <div className="flex flex-col items-end justify-center gap-4 self-stretch text-right whitespace-nowrap">
              <p className="mf-trim text-[30px] leading-[1.3] font-semibold tracking-[0.06px] text-(--mf-white)">Never Miss The Hour of Dua</p>
              <p className="mf-trim text-[16px] leading-[1.3] font-medium tracking-[0.032px] text-(--mf-warning-200)">
                Automate your donation shortly before Maghreb<span className="text-[24px]"> </span>
                <span className="font-semibold">every Friday</span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <CountrySelect value={country} onChange={setCountry} />
              <Tabs tab={tab} onChange={setTab} counts={counts} />
            </div>
            <SearchField query={query} onSearch={onSearch} className="w-[272px]" />
          </div>
        </div>

        <div role="tabpanel" aria-label={tab === 'causes' ? 'Causes' : 'Charities'} className="grid grid-cols-4 gap-4">
          {tab === 'causes'
            ? causes.map(c => (
                <Card
                  key={c.id}
                  label={c.name}
                  selected={cause === c.id}
                  onSelect={() => setCause(c.id)}
                  minHeight="min-h-[197px]"
                  header={<><CauseIcon name={c.id} /><span className={TITLE}>{c.name}</span></>}
                  description={<p className={BODY}>{c.description}</p>}
                  amountRow={<AmountRow label={c.name} currency={country.currency} amount={amount} onAmount={setAmount} onDonate={() => donate({ kind: 'cause', cause: c })} fieldWidth="w-[172px]" />}
                />
              ))
            : charities.map(c => (
                <Card
                  key={c.id}
                  label={c.name}
                  selected={charity === c.id}
                  onSelect={() => setCharity(c.id)}
                  minHeight="min-h-[186px]"
                  header={<><CharityLogo logo={c.logo} /><span className={TITLE}>{c.name}</span></>}
                  // Clamped text keeps whole line boxes (a trimmed box would clip the tops of
                  // l, d, h under the clamp's overflow), pulled in to sit like trimmed text.
                  description={<p className="mf-ff-body -my-[calc((1lh-1cap)/2)] line-clamp-2 w-full text-[16px] leading-[1.45] whitespace-pre-line text-(--mf-text)">{c.description}</p>}
                  amountRow={<AmountRow label={c.name} currency={country.currency} amount={amount} onAmount={setAmount} onDonate={() => donate({ kind: 'charity', charity: c })} fieldWidth="w-[172px]" />}
                />
              ))}
          {empty && (
            <p className="col-span-4 py-16 text-center text-[16px] leading-[1.45] text-(--mf-text-subtle)">
              Nothing matches “{query.trim()}”.
            </p>
          )}
        </div>
      </main>

      <div aria-hidden className="mf-glow absolute bottom-0 left-0 h-8 w-full" />
    </div>
  )
}
