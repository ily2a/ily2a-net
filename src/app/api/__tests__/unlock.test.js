import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const { POST } = await import('@/app/api/unlock/route')

let ipCounter = 0
function makeReq(body, { ip, headers = {} } = {}) {
  const raw = typeof body === 'string' ? body : JSON.stringify(body)
  const realIp = ip ?? `10.1.0.${++ipCounter}`
  return {
    headers: { get: (k) => (k === 'x-real-ip' ? realIp : headers[k] ?? null) },
    text: async () => raw,
  }
}

beforeEach(() => vi.stubEnv('CASE_STUDY_PASSWORD', 's3cret'))
afterEach(() => vi.unstubAllEnvs())

describe('POST /api/unlock', () => {
  it('returns 200 for the correct password', async () => {
    const res = await POST(makeReq({ password: 's3cret' }))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ success: true })
  })

  it('returns 401 for a wrong password', async () => {
    const res = await POST(makeReq({ password: 'nope' }))
    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toEqual({ success: false })
  })

  it('returns 400 for a missing password', async () => {
    const res = await POST(makeReq({}))
    expect(res.status).toBe(400)
  })

  it('returns 400 for a non-string password', async () => {
    const res = await POST(makeReq({ password: 1234 }))
    expect(res.status).toBe(400)
  })

  it('returns 500 (not 401) when CASE_STUDY_PASSWORD is unset', async () => {
    vi.stubEnv('CASE_STUDY_PASSWORD', '')
    const res = await POST(makeReq({ password: 'anything' }))
    expect(res.status).toBe(500)
  })

  it('returns 413 for an oversized body', async () => {
    const res = await POST(makeReq({ password: 'x'.repeat(5_000) }))
    expect(res.status).toBe(413)
  })

  it('returns 400 for malformed JSON', async () => {
    const res = await POST(makeReq('{bad'))
    expect(res.status).toBe(400)
  })

  it('rate-limits after 10 attempts from the same IP', async () => {
    const ip = '198.51.100.4'
    for (let i = 0; i < 10; i++) {
      const res = await POST(makeReq({ password: 'wrong' }, { ip }))
      expect(res.status).not.toBe(429)
    }
    const blocked = await POST(makeReq({ password: 'wrong' }, { ip }))
    expect(blocked.status).toBe(429)
  })
})
