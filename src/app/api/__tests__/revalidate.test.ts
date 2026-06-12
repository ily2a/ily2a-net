import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const revalidateTagMock = vi.hoisted(() => vi.fn())
vi.mock('next/cache', () => ({ revalidateTag: revalidateTagMock }))

const { POST } = await import('@/app/api/revalidate/route')

const SECRET = 'webhook-secret'
let ipCounter = 0
function makeReq({ secret, ip }: { secret?: string; ip?: string } = {}): Request {
  const realIp = ip ?? `10.2.0.${++ipCounter}`
  const headers: Record<string, string> = { 'x-real-ip': realIp }
  if (secret !== undefined) headers['x-sanity-webhook-secret'] = secret
  return { headers: { get: (k: string) => (k in headers ? headers[k] : null) } } as unknown as Request
}

beforeEach(() => {
  revalidateTagMock.mockReset()
  vi.stubEnv('SANITY_REVALIDATION_SECRET', SECRET)
})
afterEach(() => vi.unstubAllEnvs())

describe('POST /api/revalidate', () => {
  it('revalidates with the correct secret', async () => {
    const res = await POST(makeReq({ secret: SECRET }))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({ revalidated: true })
    // 'max' is the full-purge cache-life profile Next 16 requires as the second
    // arg (single-arg form is deprecated).
    expect(revalidateTagMock).toHaveBeenCalledWith('sanity', 'max')
  })

  it('returns 401 when the secret header is missing', async () => {
    const res = await POST(makeReq({}))
    expect(res.status).toBe(401)
    expect(revalidateTagMock).not.toHaveBeenCalled()
  })

  it('returns 401 for a wrong secret', async () => {
    const res = await POST(makeReq({ secret: 'wrong' }))
    expect(res.status).toBe(401)
    expect(revalidateTagMock).not.toHaveBeenCalled()
  })

  it('returns 401 (not 500) when the env secret is unset', async () => {
    vi.stubEnv('SANITY_REVALIDATION_SECRET', '')
    const res = await POST(makeReq({ secret: 'anything' }))
    expect(res.status).toBe(401)
  })

  it('returns 500 when revalidateTag throws', async () => {
    revalidateTagMock.mockImplementationOnce(() => { throw new Error('cache boom') })
    const res = await POST(makeReq({ secret: SECRET }))
    expect(res.status).toBe(500)
    await expect(res.json()).resolves.toEqual({ error: 'Revalidation failed' })
  })

  it('pre-auth rate-limits after 120 requests from the same IP', async () => {
    const ip = '192.0.2.9'
    for (let i = 0; i < 120; i++) {
      const res = await POST(makeReq({ secret: 'wrong', ip }))
      expect(res.status).not.toBe(429)
    }
    const blocked = await POST(makeReq({ secret: 'wrong', ip }))
    expect(blocked.status).toBe(429)
  })

  it('post-auth quota returns 429 after 60 authenticated requests (leaked-secret guard)', async () => {
    // The post-auth limiter is keyed on a fixed string and is a module singleton,
    // so import a fresh copy to isolate its counter from the other tests. Use
    // varying IPs so the pre-auth (120/IP) limiter never trips first.
    vi.resetModules()
    const { POST: FreshPOST } = await import('@/app/api/revalidate/route')
    for (let i = 0; i < 60; i++) {
      const res = await FreshPOST(makeReq({ secret: SECRET }))
      expect(res.status).toBe(200)
    }
    const blocked = await FreshPOST(makeReq({ secret: SECRET }))
    expect(blocked.status).toBe(429)
    await expect(blocked.json()).resolves.toEqual({ error: 'Too many requests' })
  })
})
