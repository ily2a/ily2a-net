'use client'

import { useRef, useState } from 'react'
import { EMAIL_RE, CONTACT_MAX } from '@/lib/validation'

/**
 * Form state machine for the contact form.
 *
 * Status values: 'idle' | 'sending' | 'sent' | 'error' | 'ratelimited'
 *
 * Returns:
 *   form          — { name, email, message }
 *   errors        — { name, email, message } — falsy or an error-kind string
 *                   ('required' | 'invalid' | 'tooLong') for inline UI
 *   status        — current state-machine value
 *   handleChange  — onChange handler for all three fields (uses event.target.name)
 *   handleSubmit  — form onSubmit handler; validates, POSTs, manages status
 *   reset         — clears status back to 'idle' (used by "Send another" link)
 *   resetError    — clears status and all error flags (used by "Retry" link)
 */
export function useContactForm() {
  const [form,   setForm]   = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle')
  const [errors, setErrors] = useState({ name: null, email: null, message: null })
  const abortRef = useRef(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
    if (status === 'error' || status === 'ratelimited') setStatus('idle')
  }

  const validate = () => {
    const name    = form.name.trim()
    const email   = form.email.trim()
    const message = form.message.trim()
    const e = {
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

  const handleSubmit = async (e) => {
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
      if (!res.ok) throw new Error()
      setStatus('sent')
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      if (err?.name === 'AbortError') return
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
