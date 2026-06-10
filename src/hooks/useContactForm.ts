'use client'

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { EMAIL_RE, CONTACT_MAX } from '@/lib/validation'

export type ContactStatus = 'idle' | 'sending' | 'sent' | 'error' | 'ratelimited'
type FieldError = 'required' | 'invalid' | 'tooLong' | null

interface ContactForm {
  name: string
  email: string
  message: string
  website: string
}

interface ContactErrors {
  name: FieldError
  email: FieldError
  message: FieldError
}

/**
 * Form state machine for the contact form.
 *
 * Status values: 'idle' | 'sending' | 'sent' | 'error' | 'ratelimited'
 *
 * Returns:
 *   form          — { name, email, message }
 *   errors        — { name, email, message } — null or an error-kind string
 *                   ('required' | 'invalid' | 'tooLong') for inline UI
 *   status        — current state-machine value
 *   handleChange  — onChange handler for all three fields (uses event.target.name)
 *   handleSubmit  — form onSubmit handler; validates, POSTs, manages status
 *   reset         — clears status back to 'idle' (used by "Send another" link)
 *   resetError    — clears status and all error flags (used by "Retry" link)
 */
export function useContactForm() {
  const [form,   setForm]   = useState<ContactForm>({ name: '', email: '', message: '', website: '' })
  const [status, setStatus] = useState<ContactStatus>('idle')
  const [errors, setErrors] = useState<ContactErrors>({ name: null, email: null, message: null })
  const abortRef = useRef<AbortController | null>(null)

  // Abort any in-flight submission when the form unmounts (e.g. route change
  // mid-submit) so the fetch doesn't settle into a no-op state update.
  useEffect(() => () => abortRef.current?.abort(), [])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const field = name as keyof ContactForm
    setForm((prev) => ({ ...prev, [field]: value }))
    if (field !== 'website' && errors[field]) setErrors((prev) => ({ ...prev, [field]: null }))
    if (status === 'error' || status === 'ratelimited') setStatus('idle')
  }

  const validate = (): boolean => {
    const name    = form.name.trim()
    const email   = form.email.trim()
    const message = form.message.trim()
    const e: ContactErrors = {
      name:
        !name                             ? 'required' :
        name.length > CONTACT_MAX.name    ? 'tooLong'  : null,
      email:
        !email                            ? 'required' :
        email.length > CONTACT_MAX.email  ? 'tooLong'  :
        !EMAIL_RE.test(email)             ? 'invalid'  : null,
      message:
        !message                          ? 'required' :
        message.length > CONTACT_MAX.message ? 'tooLong' : null,
    }
    setErrors(e)
    return !Object.values(e).some(Boolean)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validate()) return
    // Cancel any in-flight request before starting a new one — prevents
    // duplicate sends if the user submits twice in quick succession.
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        signal,
      })
      if (res.status === 429) { setStatus('ratelimited'); return }
      // 413 collapses into the generic error state by design — client-side
      // validation (CONTACT_MAX) keeps legitimate submissions far below the
      // server's 16k char cap, so a 413 here would only happen on truly
      // malformed input. Distinct UI would invite scope creep for an
      // unreachable path.
      if (!res.ok) throw new Error()
      setStatus('sent')
      setForm({ name: '', email: '', message: '', website: '' })
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setStatus('error')
    }
  }

  const reset      = () => setStatus('idle')
  const resetError = () => {
    setStatus('idle')
    setErrors({ name: null, email: null, message: null })
  }

  return { form, errors, status, handleChange, handleSubmit, reset, resetError }
}
