'use client'

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { MaskSvg } from './assets'
import { useCanHover } from '../device'

// The file's "Input dropdown": a field that opens a list of options. Its
// colours come from the scope's variables, so the same control is dark on
// the landing and light on Payment.

export interface SelectOption { id: string; label: string; icon?: ReactNode }

interface SelectProps {
  options: readonly SelectOption[]
  value: string
  onChange: (id: string) => void
  /** Names the control: the button reads "Country: United Kingdom". */
  label: string
  /** A default nobody has picked yet, shown in the placeholder colour like the light frames. */
  muted?: boolean
  /** Shown (in the placeholder colour) while nothing is picked. */
  placeholder?: string
  /** Opens the list above the field, for one near the bottom of a screen. */
  up?: boolean
  id?: string
  /** Sets the width. */
  className?: string
  /** Extra classes for the field itself (the light frames add a shadow). */
  fieldClassName?: string
}

export function Select({ options, value, onChange, label, muted = false, placeholder, up = false, id, className = '', fieldClassName = '' }: SelectProps) {
  const listId = useId()
  const canHover = useCanHover()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const picked = placeholder ? options.find(o => o.id === value) : options.find(o => o.id === value) ?? options[0]!
  const shown = picked?.label ?? placeholder ?? ''

  // Close on a click outside.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  // Keyboard focus lives on the list while it's open.
  useEffect(() => {
    if (open) listRef.current?.focus({ preventScroll: true })
  }, [open])

  const openList = () => {
    setActive(Math.max(0, options.findIndex(o => o.id === value)))
    setOpen(true)
  }
  const choose = (option: SelectOption) => {
    onChange(option.id)
    setOpen(false)
    buttonRef.current?.focus({ preventScroll: true })
  }

  const onButtonKey = (e: KeyboardEvent) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); openList() }
  }
  const onListKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => (i + 1) % options.length) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => (i - 1 + options.length) % options.length) }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0) }
    else if (e.key === 'End') { e.preventDefault(); setActive(options.length - 1) }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(options[active]!) }
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); buttonRef.current?.focus({ preventScroll: true }) }
    else if (e.key === 'Tab') setOpen(false)
  }

  const offset = up ? 4 : -4
  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label}: ${shown}`}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onButtonKey}
        className={`flex h-11 w-full items-center gap-2 overflow-hidden rounded-lg border bg-(--mf-bg-primary) px-[13px] py-2.5 text-left transition-colors ${
          open ? 'border-(--mf-text-secondary)' : 'border-(--mf-border)'
        } ${fieldClassName}`}
      >
        {picked?.icon}
        <span className={`mf-trim mf-ff-body flex-1 text-[16px] leading-[1.45] ${muted || !picked ? 'text-(--mf-text-placeholder)' : 'text-(--mf-text)'}`}>
          {shown}
        </span>
        <m.span className="flex" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <MaskSvg src="chevron-down.svg" width={20} height={20} className="text-(--mf-fg-quaternary)" />
        </m.span>
      </button>

      <AnimatePresence>
        {open && (
          <m.ul
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-label={label}
            aria-activedescendant={`${listId}-${options[active]!.id}`}
            onKeyDown={onListKey}
            initial={{ opacity: 0, y: offset }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: offset }}
            transition={{ duration: 0.15 }}
            className={`absolute left-0 z-20 flex w-full flex-col gap-0.5 rounded-lg border border-(--mf-border) bg-(--mf-bg-primary) p-1.5 shadow-[0_12px_16px_-4px_rgba(16,24,40,0.08),0_4px_6px_-2px_rgba(16,24,40,0.03)] outline-none ${
              up ? 'bottom-[calc(100%+4px)]' : 'top-[calc(100%+4px)]'
            }`}
          >
            {options.map((option, i) => {
              const selected = option.id === value
              return (
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events -- keys are handled on the listbox (aria-activedescendant)
                <li
                  key={option.id}
                  id={`${listId}-${option.id}`}
                  role="option"
                  aria-selected={selected}
                  onPointerEnter={canHover ? () => setActive(i) : undefined}
                  onClick={() => choose(option)}
                  className={`flex h-10 cursor-pointer items-center gap-2 rounded-md px-2.5 transition-colors ${
                    i === active ? 'bg-(--mf-bg-tertiary)' : selected ? 'bg-(--mf-bg-secondary)' : ''
                  }`}
                >
                  {option.icon}
                  <span className="mf-ff-body flex-1 text-[16px] leading-[1.45] text-(--mf-text)">{option.label}</span>
                  {selected && <MaskSvg src="check.svg" width={16.8} height={16.8} className="text-(--mf-check)" />}
                </li>
              )
            })}
          </m.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
