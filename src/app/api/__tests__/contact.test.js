import { describe, it, expect, beforeEach, vi } from 'vitest'

// resend's send is mocked at module scope; the route constructs `new Resend()`
// at import time, so the mock must be in place before the route is imported.
const sendMock = vi.hoisted(() => vi.fn())
vi.mock('resend', () => ({
  Resend: vi.fn(() => ({ emails: { send: sendMock } })),
}))

const { POST } = await import('@/app/api/contact/route')

// Unique IP per request so the module-level 5/hr rate limiter doesn't bleed
// across tests. The rate-limit test opts into a fixed IP deliberately.
let ipCounter = 0
function makeReq(body, { ip, headers = {} } = {}) {
  const raw = typeof body === 'string' ? body : JSON.stringify(body)
  const realIp = ip ?? `10.0.0.${++ipCounter}`
  return {
    headers: { get: (k) => (k === 'x-real-ip' ? realIp : headers[k] ?? null) },
    text: async () => raw,
  }
}

// Unique email+message per test so contactDedup (keyed on both) doesn't
// suppress unrelated sends.
let n = 0
function validBody(extra = {}) {
  n += 1
  return { name: `User ${n}`, email: `user${n}@example.com`, message: `Hello there number ${n}`, ...extra }
}

beforeEach(() => {
  sendMock.mockReset()
  sendMock.mockResolvedValue({}) // no error => success
})

describe('POST /api/contact', () => {
  it('sends a valid submission and returns success', async () => {
    const res = await POST(makeReq(validBody()))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ success: true })
    expect(sendMock).toHaveBeenCalledTimes(1)
  })

  it('strips header-breaker characters from name before sending', async () => {
    const body = validBody({ name: 'Foo\r\nBcc: evil@example.com' })
    const res = await POST(makeReq(body))
    expect(res.status).toBe(200)
    const arg = sendMock.mock.calls[0][0]
    // CR/LF replaced with spaces — no line terminator survives into the email.
    expect(arg.text).toContain('Name: Foo  Bcc: evil@example.com')
    expect(arg.text).not.toMatch(/Name:.*\r/)
    // replyTo is the sanitized, validated email.
    expect(arg.replyTo).toBe(body.email)
  })

  it('strips Unicode line/para separators from the email field', async () => {
    // U+2028 in the email would fail EMAIL_RE if it survived; sanitization
    // replaces it with a space, which then also fails — so this must 400, and
    // crucially must never reach resend.
    const res = await POST(makeReq(validBody({ email: 'a b@example.com' })))
    expect(res.status).toBe(400)
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('treats a filled honeypot as success without sending', async () => {
    const res = await POST(makeReq(validBody({ website: 'http://spam.example' })))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ success: true })
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('rejects an oversized body with 413 before parsing', async () => {
    const huge = JSON.stringify({ name: 'a', email: 'a@b.co', message: 'x'.repeat(20_000) })
    const res = await POST(makeReq(huge))
    expect(res.status).toBe(413)
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('rejects malformed JSON with 400', async () => {
    const res = await POST(makeReq('{not json'))
    expect(res.status).toBe(400)
  })

  it('rejects missing/blank fields with 400', async () => {
    const res = await POST(makeReq(validBody({ message: '   ' })))
    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toEqual({ error: 'Missing fields' })
  })

  it('rejects an over-length name with 400', async () => {
    const res = await POST(makeReq(validBody({ name: 'a'.repeat(101) })))
    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toEqual({ error: 'Input too long' })
  })

  it('rejects an invalid email with 400', async () => {
    const res = await POST(makeReq(validBody({ email: 'not-an-email' })))
    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toEqual({ error: 'Invalid email' })
  })

  it('returns 500 when resend reports an error', async () => {
    sendMock.mockResolvedValueOnce({ error: { message: 'boom' } })
    const res = await POST(makeReq(validBody()))
    expect(res.status).toBe(500)
    await expect(res.json()).resolves.toEqual({ error: 'Failed to send message' })
  })

  it('returns 500 when the send rejects, and preserves the retry (no markSent)', async () => {
    // A rejected send (network error) must map to 500 AND must not commit the
    // dedup key — otherwise a transient failure would suppress the user's retry.
    sendMock.mockRejectedValueOnce(new Error('network'))
    const body = validBody()
    const res = await POST(makeReq(body))
    expect(res.status).toBe(500)
    await expect(res.json()).resolves.toEqual({ error: 'Failed to send message' })

    // Resubmitting the same payload must attempt a fresh send, not dedupe to success.
    sendMock.mockResolvedValueOnce({})
    const retry = await POST(makeReq(body))
    expect(retry.status).toBe(200)
    expect(sendMock).toHaveBeenCalledTimes(2)
  })

  it('returns 500 when the send exceeds the 8s timeout', async () => {
    vi.useFakeTimers()
    try {
      // Send never resolves; the 8s timeout should win the race.
      let release
      sendMock.mockReturnValueOnce(new Promise((resolve) => { release = resolve }))
      const pending = POST(makeReq(validBody()))
      await vi.advanceTimersByTimeAsync(8000)
      const res = await pending
      expect(res.status).toBe(500)
      await expect(res.json()).resolves.toEqual({ error: 'Failed to send message' })
      release?.({}) // settle the dangling send (route swallows it)
    } finally {
      vi.useRealTimers()
    }
  })

  it('dedupes an identical immediate resubmit (200, no second send)', async () => {
    const body = validBody()
    const first = await POST(makeReq(body))
    expect(first.status).toBe(200)
    expect(sendMock).toHaveBeenCalledTimes(1)

    const second = await POST(makeReq(body))
    expect(second.status).toBe(200)
    await expect(second.json()).resolves.toEqual({ success: true })
    expect(sendMock).toHaveBeenCalledTimes(1) // no second send
  })

  it('rate-limits after 5 requests from the same IP', async () => {
    const ip = '203.0.113.7'
    for (let i = 0; i < 5; i++) {
      const res = await POST(makeReq({}, { ip })) // empty body -> 400, but counts
      expect(res.status).not.toBe(429)
    }
    const blocked = await POST(makeReq({}, { ip }))
    expect(blocked.status).toBe(429)
    await expect(blocked.json()).resolves.toEqual({ error: 'Too many requests' })
  })
})
