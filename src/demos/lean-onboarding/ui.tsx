'use client'

import { AnimatePresence, m, type HTMLMotionProps } from 'motion/react'
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode, Ref } from 'react'

// Shared Lean building blocks. Values come straight from the Figma
// components (Button primary/secondary, Option, Input, Progress bar).

export const asset = (file: string) => `/demos/lean/${file}`

const PRESS = { scale: 0.98 }

/** A fixed-colour SVG from the file, recoloured with currentColor via a CSS mask. */
export function MaskIcon({ src, width, height, className = '' }: { src: string; width: number; height: number; className?: string }) {
  const style: CSSProperties = {
    width, height,
    maskImage: `url(${asset(src)})`, WebkitMaskImage: `url(${asset(src)})`,
    maskSize: '100% 100%', WebkitMaskSize: '100% 100%',
  }
  return <span aria-hidden className={`block shrink-0 bg-current ${className}`} style={style} />
}

/** Plain decorative SVG asset at its native size. */
export function Svg({ src, width, height, className = '' }: { src: string; width: number; height: number; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- tiny local SVGs; next/image adds nothing here
  return <img src={asset(src)} alt="" aria-hidden width={width} height={height} className={`block shrink-0 ${className}`} />
}

type ButtonProps = HTMLMotionProps<'button'> & { children: ReactNode }
type ButtonSize = 'large' | 'medium' | 'small'

// DS button sizes: L 48 / M 40 with 16px text, S 36 with 14px text.
const BUTTON_SIZE: Record<ButtonSize, string> = {
  large: 'h-12 text-[16px] leading-6',
  medium: 'h-10 text-[16px] leading-6',
  small: 'h-9 text-[14px] leading-5',
}
const BUTTON_BASE = 'lean-shadow flex w-full items-center justify-center rounded-[2px] border px-6 font-bold transition-colors duration-150'
// Disabled is the same for both: grey fill, light text at 80%.
const BUTTON_DISABLED = 'border-transparent bg-(--lean-button-disabled) text-(--lean-text-inverse)'

/** DS "Button primary": Default, selected (shown while pressed), Disabled. */
export function PrimaryButton({ children, className = '', type = 'button', size = 'large', disabled, ...rest }: ButtonProps & { size?: ButtonSize }) {
  return (
    <m.button
      type={type}
      disabled={disabled}
      whileTap={disabled ? undefined : PRESS}
      className={`${BUTTON_BASE} ${BUTTON_SIZE[size]} ${
        disabled ? BUTTON_DISABLED : 'border-transparent bg-(--lean-brand) text-(--lean-text-inverse) active:bg-(--lean-brand-secondary)'
      } ${className}`}
      {...rest}
    >
      <span className={`flex items-center gap-2.5 ${disabled ? 'opacity-80' : ''}`}>{children}</span>
    </m.button>
  )
}

/** DS "Button secondary": Default, Selected (shown while pressed), Disabled. */
export function SecondaryButton({ children, className = '', type = 'button', size = 'large', disabled, ...rest }: ButtonProps & { size?: ButtonSize }) {
  return (
    <m.button
      type={type}
      disabled={disabled}
      whileTap={disabled ? undefined : PRESS}
      className={`${BUTTON_BASE} ${BUTTON_SIZE[size]} ${
        disabled ? BUTTON_DISABLED : 'border-transparent bg-(--lean-button-secondary) text-(--lean-text-secondary) active:border-(--lean-brand-secondary)'
      } ${className}`}
      {...rest}
    >
      <span className={`flex items-center gap-2.5 ${disabled ? 'opacity-80' : ''}`}>{children}</span>
    </m.button>
  )
}

/**
 * Choice button, built on DS "Button secondary": the picked option is
 * Selected (1px #61554b outline); every other option stays Default, and
 * with nothing picked yet they're all Default. Pressing shows the outline.
 */
export function OptionButton({ selected, children, className = '', ...rest }: ButtonProps & { selected: boolean }) {
  return (
    <m.button
      type="button"
      role="radio"
      aria-checked={selected}
      whileTap={PRESS}
      className={`lean-shadow flex h-12 w-full items-center justify-center rounded-[2px] border bg-(--lean-button-secondary) px-6 text-[16px] leading-6 font-bold text-(--lean-text-secondary) transition-colors duration-150 ${
        selected ? 'border-(--lean-brand-secondary)' : 'border-transparent active:border-(--lean-brand-secondary)'
      } ${className}`}
      {...rest}
    >
      {children}
    </m.button>
  )
}

const errorId = (inputId: string) => `${inputId}-error`

/**
 * The Figma "Input" component with all four of its states:
 * Default (light border), Focused (muted border), Error (red border and
 * text) and Disabled (grey fill, light text at 80%).
 */
export function TextInput({ trailing, invalid = false, className = '', ...rest }: ComponentPropsWithoutRef<'input'> & { trailing?: ReactNode; invalid?: boolean }) {
  const disabled = !!rest.disabled
  const box = disabled
    ? 'border-(--lean-border-subtle) bg-(--lean-button-disabled)'
    : invalid
      ? 'border-(--lean-border-destructive) bg-(--lean-bg-inputs)'
      : 'border-(--lean-border-default) bg-(--lean-bg-inputs) focus-within:border-(--lean-border-muted)'
  const text = disabled ? 'text-(--lean-text-inverse) opacity-80' : invalid ? 'text-(--lean-text-destructive)' : 'text-(--lean-text-primary)'
  return (
    <div className={`lean-shadow flex w-full items-center gap-2 rounded-[4px] border px-3 py-2.5 transition-colors duration-150 ${box}`}>
      <input
        aria-invalid={invalid || undefined}
        aria-describedby={invalid && rest.id ? errorId(rest.id) : undefined}
        className={`min-w-0 flex-1 bg-transparent text-[16px] leading-6 outline-none transition-colors duration-150 ${text} ${className}`}
        {...rest}
      />
      {trailing && <span className={`flex shrink-0 ${disabled ? 'opacity-80' : ''}`}>{trailing}</span>}
    </div>
  )
}

/** Error support message: red, 3px under the input, eased in and out. */
function ErrorMessage({ inputId, message }: { inputId: string; message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <m.div
          key="error"
          className="overflow-hidden"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <p id={errorId(inputId)} className="pt-[3px] text-[12px] leading-[18px] font-medium text-(--lean-text-destructive-muted)">
            {message}
          </p>
        </m.div>
      )}
    </AnimatePresence>
  )
}

/** Label, input, then the error (if any) and the muted support message. */
export function Field({ label, htmlFor, error, support, children }: { label: string; htmlFor: string; error?: string; support?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[14px] leading-5 font-medium text-(--lean-text-secondary)">{label}</label>
      <div className="flex w-full flex-col">
        {children}
        <ErrorMessage inputId={htmlFor} message={error} />
      </div>
      {support && <div className="text-[12px] leading-[18px] font-medium text-(--lean-text-muted)">{support}</div>}
    </div>
  )
}

export function Logo({ size = 'small' }: { size?: 'small' | 'splash' | 'welcome' }) {
  if (size === 'splash') return <Svg src="logo-splash.svg" width={217} height={64} />
  if (size === 'welcome') return <Svg src="logo-welcome.svg" width={249} height={96} />
  return <Svg src="logo-small.svg" width={121} height={36} />
}

export function StatusBar() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-20 h-11">
      <Svg src="status-time.svg" width={54} height={21} className="absolute left-[21px] top-3" />
      <Svg src="status-right.svg" width={66.662} height={11.336} className="absolute right-[14.67px] top-[17.33px]" />
    </div>
  )
}

export function HomeIndicator() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex h-10 items-end justify-center pb-2">
      <div className="h-[5px] w-[134px] rounded-full bg-(--lean-brand)" />
    </div>
  )
}

/** Screen shell: content from below the status bar, optional sticky footer CTA. */
export function Screen({ children, footer, scroll = false }: { children: ReactNode; footer?: ReactNode; scroll?: boolean }) {
  return (
    // pt-11 keeps scrolling content out from under the status bar.
    <div className="absolute inset-0 flex flex-col bg-(--lean-bg-screen) pt-11">
      <div className={`flex flex-1 flex-col px-4 pt-[19px] pb-5 ${scroll ? 'overflow-y-auto overscroll-contain' : 'overflow-hidden'}`}>
        {children}
      </div>
      {footer && <div className="flex flex-col items-center bg-(--lean-bg-screen) px-4 pt-2 pb-[52px]">{footer}</div>}
    </div>
  )
}

export function Title({ id, title, subtitle, headingRef }: { id?: string; title: string; subtitle?: ReactNode; headingRef?: Ref<HTMLHeadingElement> }) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <h2 id={id} ref={headingRef} tabIndex={headingRef ? -1 : undefined} className="text-[18px] leading-7 font-bold text-(--lean-text-secondary)">
        {title}
      </h2>
      {subtitle && <div className="text-[16px] leading-6 text-(--lean-text-muted)">{subtitle}</div>}
    </div>
  )
}

// The step number rolls: up when moving forward, down when going back.
const ROLL = {
  enter: (dir: number) => ({ y: dir < 0 ? '-100%' : '100%', opacity: 0 }),
  center: { y: '0%', opacity: 1 },
  exit: (dir: number) => ({ y: dir < 0 ? '100%' : '-100%', opacity: 0 }),
}

/**
 * Stays mounted across steps 1–9, so the bar grows from where it was
 * instead of being redrawn at the new width on every step.
 */
export function ProgressHeader({ step, total = 9, dir = 1, onBack }: { step: number; total?: number; dir?: number; onBack: () => void }) {
  return (
    <div className="flex w-full items-center gap-2">
      <button type="button" onClick={onBack} aria-label="Back" className="flex size-6 shrink-0 items-center justify-center text-(--lean-text-secondary)">
        <Svg src="icon-back.svg" width={7.5} height={13.5} />
      </button>
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={step}
        aria-valuetext={`Step ${step} of ${total}`}
        aria-label="Onboarding progress"
        className="h-3 flex-1 overflow-hidden rounded-full border border-(--lean-border-subtle) bg-(--lean-bg-inputs)"
      >
        <m.div
          className="h-full rounded-full bg-(--lean-tag-primary)"
          initial={{ width: '0%' }}
          animate={{ width: `${(step / total) * 100}%` }}
          transition={{ type: 'spring', stiffness: 170, damping: 26 }}
        />
      </div>
      {/* Tabular figures keep the counter one width, so the track doesn't jitter. */}
      <p aria-hidden className="flex shrink-0 text-[20px] leading-[30px] font-bold text-(--lean-text-secondary) tabular-nums">
        <span className="inline-grid h-[30px] overflow-hidden">
          <AnimatePresence initial={false} custom={dir}>
            <m.span
              key={step}
              custom={dir}
              variants={ROLL}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              className="[grid-area:1/1] text-right"
            >
              {step}
            </m.span>
          </AnimatePresence>
        </span>
        <span className="whitespace-pre"> of {total}</span>
      </p>
    </div>
  )
}

/** Radio dot used by the paywall plans. */
export function Radio({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`relative block size-6 shrink-0 rounded-full transition-colors duration-150 ${checked ? 'bg-(--lean-brand)' : 'border border-(--lean-border-muted)'}`}
    >
      <m.span
        className="absolute inset-[30%] rounded-full bg-(--lean-bg-screen)"
        initial={false}
        animate={{ scale: checked ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </span>
  )
}

export function Tag({ children, tone = 'primary', className = '' }: { children: ReactNode; tone?: 'primary' | 'secondary' | 'tertiary' | 'sale'; className?: string }) {
  const tones = {
    primary: 'bg-(--lean-tag-primary) text-(--lean-text-secondary)',
    secondary: 'bg-(--lean-tag-secondary) text-(--lean-text-inverse)',
    tertiary: 'border-[0.3px] border-(--lean-border-muted) bg-(--lean-tag-tertiary) text-(--lean-text-primary)',
    sale: 'bg-(--lean-tag-sale) text-(--lean-text-primary)',
  }
  return (
    <span className={`inline-flex h-6 shrink-0 items-center justify-center rounded-xl px-1.5 text-[12px] leading-[18px] font-medium whitespace-nowrap ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}
