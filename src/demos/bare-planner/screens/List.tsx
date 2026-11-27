'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import type { ListSection } from '../data'
import { Checkbox, MaskIcon, PrimaryButton, TabBar } from '../ui'
import { BackButton, ScreenHeader } from './Picker'

// The finished list (Figma › Food planner › Food diares shopping list 3):
// every picked dish's ingredients merged and grouped by aisle, each group
// collapsible (DS "Category Container"). Ticking an item off greys it out;
// Share copies the list as text.

const BUILD_MS = 900

const toText = (sections: ListSection[]) =>
  ['BARE shopping list', ...sections.flatMap(s => ['', s.label, ...s.items.map(i => `- ${i.name}: ${i.qty}`)])].join('\n')

export function List({ sections, onBack }: { sections: ListSection[]; onBack: () => void }) {
  const [building, setBuilding] = useState(true)
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set())
  const [got, setGot] = useState<ReadonlySet<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const total = useMemo(() => sections.reduce((n, s) => n + s.items.length, 0), [sections])

  useEffect(() => {
    const t = setTimeout(() => setBuilding(false), BUILD_MS)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const flip = (set: ReadonlySet<string>, id: string) => {
    const next = new Set(set)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  }

  const share = async () => {
    let message = 'List ready to send'
    try {
      await navigator.clipboard.writeText(toText(sections))
      message = 'Copied to your clipboard'
    } catch { /* clipboard blocked (e.g. not focused): keep the generic message */ }
    setToast(message)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2200)
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-(--bare-bg-screen) pt-11">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-4 pb-5">
        <ScreenHeader>
          <BackButton onClick={onBack} />
          <div className="flex flex-col">
            <h2 tabIndex={-1} className="text-[18px] leading-7 font-semibold">Shopping list</h2>
            {!building && (
              <p aria-live="polite" className="text-[12px] leading-[18px] text-(--bare-text-brand)">
                {got.size} of {total} items in your basket
              </p>
            )}
          </div>
        </ScreenHeader>

        <AnimatePresence mode="wait" initial={false}>
          {building ? (
            <m.div key="building" role="status" className="flex flex-1 flex-col items-center justify-center gap-4 pb-20"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <m.span
                aria-hidden
                className="size-12 rounded-full border-4 border-(--bare-button-terciary) border-t-(--bare-brand)"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
              />
              <p className="text-center text-[16px] leading-6 font-medium text-(--bare-text-brand)">
                Adding up your ingredients…
              </p>
            </m.div>
          ) : (
            <m.div key="list" className="flex flex-col gap-6" initial="hidden" animate="shown"
              variants={{ shown: { transition: { staggerChildren: 0.06 } } }}>
              {sections.map(section => {
                const open = !collapsed.has(section.id)
                return (
                  <m.section
                    key={section.id}
                    aria-label={section.label}
                    className="flex flex-col gap-4"
                    variants={{ hidden: { opacity: 0, y: 10 }, shown: { opacity: 1, y: 0 } }}
                  >
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setCollapsed(c => flip(c, section.id))}
                      className="flex w-full items-center justify-between text-left"
                    >
                      <h3 className="truncate text-[16px] leading-6 font-semibold">{section.label}</h3>
                      <m.span className="flex size-6 items-center justify-center" animate={{ rotate: open ? 180 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 34 }}>
                        <MaskIcon src="icon-chevron.svg" width={13.5} height={7.5} className="text-(--bare-text-primary)" />
                      </m.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <m.ul
                          className="flex flex-col gap-2 overflow-hidden"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 420, damping: 40 }}
                        >
                          {section.items.map(item => {
                            const done = got.has(item.id)
                            return (
                              <li key={item.id} className="flex h-12 items-center justify-between gap-2 rounded-[10px] bg-(--bare-bg-surface) pr-2 pl-3">
                                <div className="flex min-w-0 items-center gap-3">
                                  <Checkbox state={done ? 'checked' : 'unchecked'} label={item.name} onToggle={() => setGot(g => flip(g, item.id))} />
                                  <span className={`truncate text-[14px] leading-5 transition-colors duration-200 ${
                                    done ? 'text-(--bare-text-muted) line-through' : 'text-(--bare-text-primary)'
                                  }`}>
                                    {item.name}
                                  </span>
                                </div>
                                <span className={`shrink-0 rounded-[10px] bg-(--bare-bg-subtle) p-2 text-[14px] leading-5 font-medium transition-opacity duration-200 ${done ? 'opacity-50' : ''}`}>
                                  {item.qty}
                                </span>
                              </li>
                            )
                          })}
                        </m.ul>
                      )}
                    </AnimatePresence>
                  </m.section>
                )
              })}
            </m.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative flex flex-col items-center gap-4 bg-(--bare-bg-surface) pt-4">
        <AnimatePresence>
          {toast && (
            <m.p
              key="toast"
              role="status"
              className="absolute -top-14 rounded-[10px] bg-(--bare-brand) px-4 py-2.5 text-[14px] leading-5 font-medium text-(--bare-text-inverse) shadow-lg"
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 34 }}
            >
              {toast}
            </m.p>
          )}
        </AnimatePresence>
        <div className="w-full px-4">
          <PrimaryButton disabled={building} onClick={share}>Share shopping list</PrimaryButton>
        </div>
        <TabBar />
      </div>
    </div>
  )
}
