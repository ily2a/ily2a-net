'use client'

import { useState, useId, useRef, useEffect } from 'react'
import { m } from 'framer-motion'
import { EASE_OUT } from '@/constants/animations'

const GAP_PAD  = 4
const LBL_LEFT = 14
const R        = 10

const INPUT_CLS = "text-field-input block w-full rounded-[10px] px-3.5 py-3 outline-none border-0 text-text-primary bg-[color-mix(in_srgb,var(--color-surface)_60%,var(--color-background))]"

function useDims(ref) {
  const [dims, setDims] = useState({ w: 0, h: 0 })
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(() => {
      const el = ref.current
      if (!el) return
      setDims({ w: el.offsetWidth, h: el.offsetHeight })
    })
    ro.observe(ref.current)
    setDims({ w: ref.current.offsetWidth, h: ref.current.offsetHeight })
    return () => ro.disconnect()
  }, [ref])
  return dims
}

function NotchedBorder({ floated, hasError, focused, labelWidth, width, height }) {
  if (!width || !height) return null

  const gapStart = LBL_LEFT - GAP_PAD
  const gapEnd   = LBL_LEFT + (floated ? labelWidth * 0.8 : 0) + GAP_PAD
  const stroke        = hasError ? 'var(--color-error)' : 'var(--color-amethyst-400)'
  const strokeOpacity = hasError ? 1 : focused ? 1 : 0.5

  const path = floated
    ? `M ${gapEnd} 0 L ${width-R} 0 Q ${width} 0 ${width} ${R} L ${width} ${height-R} Q ${width} ${height} ${width-R} ${height} L ${R} ${height} Q 0 ${height} 0 ${height-R} L 0 ${R} Q 0 0 ${R} 0 L ${gapStart} 0`
    : `M ${R} 0 L ${width-R} 0 Q ${width} 0 ${width} ${R} L ${width} ${height-R} Q ${width} ${height} ${width-R} ${height} L ${R} ${height} Q 0 ${height} 0 ${height-R} L 0 ${R} Q 0 0 ${R} 0 Z`

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" aria-hidden="true">
      <m.path
        d={path} fill="none" strokeWidth="1" strokeLinecap="round"
        initial={{ stroke, strokeOpacity }}
        animate={{ stroke, strokeOpacity }}
        transition={{ duration: 0.2, ease: EASE_OUT }}
      />
    </svg>
  )
}

function useFloatingLabel() {
  const uid     = useId()
  const wrapRef  = useRef(null)
  const labelRef = useRef(null)
  const [focused, setFocused] = useState(false)
  const wrapDims  = useDims(wrapRef)
  const labelDims = useDims(labelRef)
  return { uid, focused, setFocused, wrapRef, labelRef, wrapDims, labelWidth: labelDims.w }
}

function FloatingLabel({ htmlFor, labelRef, floated, hasError, focused, children, restingTop = '50%', required }) {
  return (
    <m.label
      htmlFor={htmlFor}
      className="text-field-label absolute left-[14px] pointer-events-none select-none origin-top-left -translate-y-1/2"
      animate={{
        top:   floated ? 0 : restingTop,
        scale: floated ? 0.8 : 1,
        color: hasError ? 'var(--color-error)' : focused ? 'var(--color-brand)' : 'var(--color-text-secondary)',
      }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
    >
      <span ref={labelRef}>
        {children}
        {required && <span aria-hidden="true" className="ml-[3px]">*</span>}
      </span>
    </m.label>
  )
}

export function FloatingLabelInput({
  id: idProp, label, name, type = 'text', value, onChange,
  hasError, errorId, autoComplete, required, rightSlot, maxLength,
}) {
  const { uid, focused, setFocused, wrapRef, labelRef, wrapDims, labelWidth } = useFloatingLabel()
  const id = idProp ?? uid
  const floated = focused || !!value

  return (
    <div ref={wrapRef} className="relative">
      {/* Labeled by <FloatingLabel htmlFor={id}> below — the rule can't see the cross-component association. */}
      {/* react-doctor-disable-next-line react-doctor/control-has-associated-label */}
      <input
        id={id} name={name} type={type} value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        required={required} autoComplete={autoComplete} maxLength={maxLength} placeholder=""
        className={`${INPUT_CLS} ${rightSlot ? 'pr-11' : ''}`}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
      />
      {rightSlot && (
        <div className="absolute right-3 inset-y-0 flex items-center">{rightSlot}</div>
      )}
      <NotchedBorder floated={floated} hasError={hasError} focused={focused} labelWidth={labelWidth} width={wrapDims.w} height={wrapDims.h} />
      <FloatingLabel htmlFor={id} labelRef={labelRef} floated={floated} hasError={hasError} focused={focused} required={required}>
        {label}
      </FloatingLabel>
    </div>
  )
}

export function FloatingLabelTextarea({
  id: idProp, label, name, value, onChange,
  hasError, errorId, rows = 6, required, maxLength,
}) {
  const { uid, focused, setFocused, wrapRef, labelRef, wrapDims, labelWidth } = useFloatingLabel()
  const id = idProp ?? uid
  const floated = focused || !!value

  return (
    <div ref={wrapRef} className="relative">
      {/* Labeled by <FloatingLabel htmlFor={id}> below — the rule can't see the cross-component association. */}
      {/* react-doctor-disable-next-line react-doctor/control-has-associated-label */}
      <textarea
        id={id} name={name} value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        required={required} rows={rows} maxLength={maxLength} placeholder=""
        className={`${INPUT_CLS} resize-y`}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
      />
      <NotchedBorder floated={floated} hasError={hasError} focused={focused} labelWidth={labelWidth} width={wrapDims.w} height={wrapDims.h} />
      <FloatingLabel htmlFor={id} labelRef={labelRef} floated={floated} hasError={hasError} focused={focused} restingTop="22px" required={required}>
        {label}
      </FloatingLabel>
    </div>
  )
}
