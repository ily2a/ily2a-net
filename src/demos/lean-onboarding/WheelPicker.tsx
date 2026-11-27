'use client'

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { m } from 'motion/react'

// The age / weight / height picker. Five rows around the current value,
// styled by distance from the centre exactly like the Figma frames
// (48 bold → 36 medium → 24 medium inactive). Drag, scroll, arrow keys,
// or tap a neighbouring number to change it.

const STEP_PX = 36 // drag / scroll distance per value

const ROW_STYLES = [
  'text-[48px] leading-[60px] font-bold tracking-[-0.96px] text-(--lean-text-secondary)',
  'text-[36px] leading-[44px] font-medium tracking-[-0.72px] text-(--lean-text-muted)',
  'text-[24px] leading-8 font-medium text-(--lean-text-inactive)',
]

interface WheelPickerProps {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  unit: string
  label: string
  format?: (value: number) => string
}

export default function WheelPicker({ value, min, max, onChange, unit, label, format = String }: WheelPickerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [dir, setDir] = useState(0) // which way the numbers slide in
  const drag = useRef<{ y: number; acc: number } | null>(null)
  const wheelAcc = useRef(0)
  // Latest props for the native wheel listener, which is attached once
  // (min/max change when the unit switches between kg and lbs).
  const latest = useRef({ value, onChange, min, max })
  useEffect(() => { latest.current = { value, onChange, min, max } })

  const step = (by: number) => {
    const { min: lo, max: hi } = latest.current
    const next = Math.min(hi, Math.max(lo, latest.current.value + by))
    if (next === latest.current.value) return
    // Several steps can land before React re-renders (fast scroll / drag).
    latest.current.value = next
    setDir(Math.sign(by))
    latest.current.onChange(next)
  }

  // Non-passive so the page doesn't scroll while you spin the wheel.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      wheelAcc.current += e.deltaY
      while (Math.abs(wheelAcc.current) >= STEP_PX) {
        const s = Math.sign(wheelAcc.current)
        wheelAcc.current -= s * STEP_PX
        step(s)
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const onPointerDown = (e: PointerEvent) => {
    drag.current = { y: e.clientY, acc: 0 }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: PointerEvent) => {
    const d = drag.current
    if (!d) return
    d.acc += d.y - e.clientY // drag up → larger values come in from below
    d.y = e.clientY
    while (Math.abs(d.acc) >= STEP_PX) {
      const s = Math.sign(d.acc)
      d.acc -= s * STEP_PX
      step(s)
    }
  }
  const onPointerUp = () => { drag.current = null }

  const onKeyDown = (e: KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 10, PageDown: -10 }
    if (e.key in keys) { e.preventDefault(); step(keys[e.key]!) }
    else if (e.key === 'Home') { e.preventDefault(); setDir(-1); onChange(min) }
    else if (e.key === 'End') { e.preventDefault(); setDir(1); onChange(max) }
  }

  return (
    <div
      ref={ref}
      role="spinbutton"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${format(value)} ${unit}`}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="relative flex cursor-grab touch-none select-none justify-center rounded-[4px] active:cursor-grabbing"
    >
      <m.div
        key={value}
        className="flex w-[59px] flex-col items-center gap-6 text-center whitespace-nowrap"
        initial={{ y: dir * 24, opacity: 0.6 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      >
        {[-2, -1, 0, 1, 2].map(offset => {
          const v = value + offset
          const inRange = v >= min && v <= max
          return (
            <span
              key={offset}
              aria-hidden
              onClick={inRange && offset !== 0 ? () => { setDir(Math.sign(offset)); onChange(v) } : undefined}
              className={`${ROW_STYLES[Math.abs(offset)]} ${inRange ? '' : 'invisible'}`}
            >
              {inRange ? format(v) : '0'}
            </span>
          )
        })}
      </m.div>
      <span aria-hidden className="absolute top-[140px] left-[calc(50%+80px)] -translate-x-1/2 text-[18px] leading-7 font-medium whitespace-nowrap text-(--lean-text-secondary)">
        {unit}
      </span>
    </div>
  )
}
