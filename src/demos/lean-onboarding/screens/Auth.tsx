'use client'

import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { Field, Logo, PrimaryButton, Svg, TextInput } from '../ui'

// Login and Sign up share one layout: logo, fields, CTA, and the
// "Don't have an account?" switch pinned near the bottom (top: 720px).
//
// Input states come from the DS: the CTA stays Disabled until every field
// has something in it; pressing it then checks the values and puts any
// bad field into its Error state (red border, text and support message).

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SPECIAL = /[^A-Za-z0-9]/

const emailError = (v: string) =>
  !v.trim() ? 'Enter your email' : EMAIL.test(v.trim()) ? undefined : 'Enter a valid email address'

/** Move focus to the first field that failed, so the error is read out. */
function focusFirstInvalid(fields: [id: string, error: string | undefined][]) {
  const first = fields.find(([, error]) => error)
  if (first) document.getElementById(first[0])?.focus()
}

function AuthLayout({ children, prompt, linkLabel, onLink }: { children: ReactNode; prompt: string; linkLabel: string; onLink: () => void }) {
  return (
    <div className="absolute inset-0 bg-(--lean-bg-screen)">
      <div className="absolute top-16 left-4 flex w-[343px] flex-col items-center gap-8">
        <Logo />
        {children}
      </div>
      <div className="absolute top-[720px] left-4 flex w-[343px] items-start justify-center gap-2 text-[14px] leading-5">
        <p className="text-(--lean-text-muted)">{prompt}</p>
        <button type="button" onClick={onLink} className="font-semibold text-(--lean-text-secondary) underline">
          {linkLabel}
        </button>
      </div>
    </div>
  )
}

function PasswordInput({ id, placeholder, value, onChange, invalid }: { id: string; placeholder: string; value: string; onChange: (v: string) => void; invalid?: boolean }) {
  const [visible, setVisible] = useState(false)
  return (
    <TextInput
      id={id}
      type={visible ? 'text' : 'password'}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      autoComplete="off"
      invalid={invalid}
      trailing={
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className={`flex size-6 shrink-0 items-center justify-center transition-opacity ${visible ? 'opacity-100' : 'opacity-70'}`}
        >
          <Svg src="icon-eye.svg" width={21.5} height={15.5} />
        </button>
      }
    />
  )
}

export function Login({ onSubmit, onSignup }: { onSubmit: () => void; onSignup: () => void }) {
  const id = useId()
  const emailId = `${id}-email`
  const pwId = `${id}-pw`
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tried, setTried] = useState(false)

  const errors = { email: emailError(email), password: password ? undefined : 'Enter your password' }
  const shown: Partial<typeof errors> = tried ? errors : {}
  const filled = email.trim() !== '' && password !== ''

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!filled) return
    if (errors.email || errors.password) {
      setTried(true)
      focusFirstInvalid([[emailId, errors.email], [pwId, errors.password]])
      return
    }
    onSubmit()
  }

  return (
    <AuthLayout prompt="Don’t have an account?" linkLabel="Sign up" onLink={onSignup}>
      <form onSubmit={submit} noValidate className="flex w-full flex-col items-center gap-8" aria-label="Login">
        <div className="flex w-full flex-col gap-4">
          <Field label="Email" htmlFor={emailId} error={shown.email}>
            <TextInput id={emailId} type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="off" invalid={!!shown.email} />
          </Field>
          <Field label="Password" htmlFor={pwId} error={shown.password} support="Forgot your password ?">
            <PasswordInput id={pwId} placeholder="Enter your password" value={password} onChange={setPassword} invalid={!!shown.password} />
          </Field>
        </div>
        <PrimaryButton type="submit" disabled={!filled}>Login</PrimaryButton>
      </form>
    </AuthLayout>
  )
}

function Hint({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <div className="flex w-full items-start gap-2">
      <Svg src={ok ? 'check-active.svg' : 'check-idle.svg'} width={20} height={20} />
      <p className="flex-1 text-[12px] leading-[18px] text-(--lean-text-muted)">
        {children}
        <span className="sr-only">{ok ? ' (done)' : ' (not yet)'}</span>
      </p>
    </div>
  )
}

export function Signup({ onSubmit, onLogin }: { onSubmit: () => void; onLogin: () => void }) {
  const id = useId()
  const emailId = `${id}-email`
  const pwId = `${id}-pw`
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [optIn, setOptIn] = useState(true)
  const [tried, setTried] = useState(false)

  const longEnough = password.length >= 8
  const hasSpecial = SPECIAL.test(password)
  const errors = {
    email: emailError(email),
    password: !password ? 'Create a password' : longEnough && hasSpecial ? undefined : 'Use at least 8 characters and one special character',
  }
  const shown: Partial<typeof errors> = tried ? errors : {}
  const filled = email.trim() !== '' && password !== ''

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!filled) return
    if (errors.email || errors.password) {
      setTried(true)
      focusFirstInvalid([[emailId, errors.email], [pwId, errors.password]])
      return
    }
    onSubmit()
  }

  return (
    <AuthLayout prompt="Already have an account?" linkLabel="Login" onLink={onLogin}>
      <form onSubmit={submit} noValidate className="flex w-full flex-col items-center gap-8" aria-label="Sign up">
        <div className="flex w-full flex-col gap-4">
          <Field label="Email" htmlFor={emailId} error={shown.email}>
            <TextInput id={emailId} type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="off" invalid={!!shown.email} />
          </Field>
          <div className="flex w-full flex-col gap-3">
            <Field label="Password" htmlFor={pwId} error={shown.password}>
              <PasswordInput id={pwId} placeholder="Create a password" value={password} onChange={setPassword} invalid={!!shown.password} />
            </Field>
            <div className="flex w-full flex-col gap-3" aria-live="polite">
              <Hint ok={longEnough}>Must be at least 8 characters</Hint>
              <Hint ok={hasSpecial}>Must contain one special character</Hint>
            </div>
          </div>
          <label className="flex w-full cursor-pointer items-start gap-2 rounded-[2px] outline-offset-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-(--lean-brand)">
            <input type="checkbox" checked={optIn} onChange={e => setOptIn(e.target.checked)} className="sr-only" />
            <Svg src={optIn ? 'checkbox-active.svg' : 'checkbox-idle.svg'} width={16} height={16} />
            <span className="flex-1 text-[12px] leading-[18px] font-medium text-(--lean-text-primary)">
              Join the LEAN community and get early access to exclusive content, product drops, and offers.
            </span>
          </label>
        </div>
        <PrimaryButton type="submit" disabled={!filled}>Create account</PrimaryButton>
      </form>
    </AuthLayout>
  )
}
