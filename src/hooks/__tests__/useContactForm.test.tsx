// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act, cleanup } from '@testing-library/react'
import { useContactForm } from '@/hooks/useContactForm'

// The API route's contract (status codes) is tested separately; this pins the
// CLIENT's interpretation of it — the validation and submit state machine. A
// regression here (e.g. mapping 429 to 'error', or dropping the abort guard
// that prevents duplicate sends) would otherwise ship green.

type FetchMock = ReturnType<typeof vi.fn>

function mockFetch(impl: (input: unknown, init?: RequestInit) => Promise<Response>): FetchMock {
  const fn = vi.fn(impl)
  global.fetch = fn as unknown as typeof fetch
  return fn
}

const res = (status: number): Response =>
  ({ ok: status >= 200 && status < 300, status } as Response)

const evt = { preventDefault() {} } as unknown as React.FormEvent<HTMLFormElement>
const change = (name: string, value: string) =>
  ({ target: { name, value } } as unknown as React.ChangeEvent<HTMLInputElement>)

function fill(result: { current: ReturnType<typeof useContactForm> }) {
  act(() => {
    result.current.handleChange(change('name', 'Ada Lovelace'))
    result.current.handleChange(change('email', 'ada@example.com'))
    result.current.handleChange(change('message', 'Hello, I have a project in mind.'))
  })
}

afterEach(() => { cleanup(); vi.restoreAllMocks() })
beforeEach(() => { vi.clearAllMocks() })

describe('useContactForm', () => {
  it('submits a valid form and transitions idle → sending → sent, then resets the form', async () => {
    const fetchMock = mockFetch(async () => res(200))
    const { result } = renderHook(() => useContactForm())
    fill(result)

    await act(async () => { await result.current.handleSubmit(evt) })

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock.mock.calls[0]![0]).toBe('/api/contact')
    expect(result.current.status).toBe('sent')
    expect(result.current.form.name).toBe('')
    expect(result.current.form.message).toBe('')
  })

  it('blocks submit and flags required fields when empty', async () => {
    const fetchMock = mockFetch(async () => res(200))
    const { result } = renderHook(() => useContactForm())

    await act(async () => { await result.current.handleSubmit(evt) })

    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.current.status).toBe('idle')
    expect(result.current.errors).toEqual({ name: 'required', email: 'required', message: 'required' })
  })

  it('flags an invalid email and does not submit', async () => {
    const fetchMock = mockFetch(async () => res(200))
    const { result } = renderHook(() => useContactForm())
    act(() => {
      result.current.handleChange(change('name', 'Ada'))
      result.current.handleChange(change('email', 'not-an-email'))
      result.current.handleChange(change('message', 'A sufficiently long message.'))
    })

    await act(async () => { await result.current.handleSubmit(evt) })

    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.current.errors.email).toBe('invalid')
  })

  it('maps a 429 response to the ratelimited state', async () => {
    mockFetch(async () => res(429))
    const { result } = renderHook(() => useContactForm())
    fill(result)

    await act(async () => { await result.current.handleSubmit(evt) })

    expect(result.current.status).toBe('ratelimited')
  })

  it('maps a non-ok response to the error state', async () => {
    mockFetch(async () => res(500))
    const { result } = renderHook(() => useContactForm())
    fill(result)

    await act(async () => { await result.current.handleSubmit(evt) })

    expect(result.current.status).toBe('error')
  })

  it('does not flip to error when the request is aborted', async () => {
    // The hook swallows errors named 'AbortError' (err instanceof Error &&
    // name === 'AbortError'). jsdom's DOMException isn't instanceof Error, so
    // model the abort with a plain Error named AbortError, matching the guard.
    mockFetch(async () => {
      const err = new Error('aborted')
      err.name = 'AbortError'
      throw err
    })
    const { result } = renderHook(() => useContactForm())
    fill(result)

    await act(async () => { await result.current.handleSubmit(evt) })

    // AbortError is swallowed — status stays 'sending', never 'error'.
    expect(result.current.status).not.toBe('error')
  })
})
