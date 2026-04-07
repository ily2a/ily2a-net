'use client'

import { useState } from 'react'
import { EMAIL_RE } from '@/lib/validation'

/**
 * Form state machine for the contact form.
 *
 * Status values: 'idle' | 'sending' | 'sent' | 'error' | 'ratelimited'
 *
 * Returns:
 *   form          — { name, email, message }
 *   errors        — { name, email, message } booleans for inline error UI
 *   status        — current state-machine value
 *   handleChange  — onChange handler for all three fields (uses event.target.name)
 *   handleSubmit  — form onSubmit handler; validates, POSTs, manages status
 *   reset         — clears status back to 'idle' (used by "Send another" link)
 *   resetError    — clears status and all error flags (used by "Retry" link)
 */
export function useContactForm() {
  const [form,   setForm]   = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle')
  const [errors, setErrors] = useState({ name: false, email: false, message: false })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: false }))
    if (status === 'error') setStatus('idle')
  }

  const validate = () => {
    const e = {
      name:    !form.name.trim(),
      email:   !form.email.trim() || !EMAIL_RE.test(form.email),
      message: !form.message.trim(),
    }
    setErrors(e)
    return !Object.values(e).some(Boolean)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.status === 429) { setStatus('ratelimited'); return }
      if (!res.ok) throw new Error()
      setStatus('sent')
      setForm({ name: '', email: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  const reset      = () => setStatus('idle')
  const resetError = () => {
    setStatus('idle')
    setErrors({ name: false, email: false, message: false })
  }

  return { form, errors, status, handleChange, handleSubmit, reset, resetError }
}
