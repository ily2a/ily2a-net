import { timingSafeEqual } from 'crypto'

// ── Rate limiting ──────────────────────────────────────────────────────────────
// 10 attempts per IP per hour — tighter than contact (5/hr) since this is auth.
// Same in-memory pattern: per-instance, resets on cold start. Sufficient for
// a portfolio; swap for Upstash KV if brute-force becomes a real concern.
const RATE_LIMIT = 10
const WINDOW_MS  = 60 * 60 * 1000

const ipLog = new Map()

function isRateLimited(ip) {
  const now  = Date.now()
  const hits = (ipLog.get(ip) ?? []).filter(t => now - t < WINDOW_MS)
  if (hits.length >= RATE_LIMIT) return true
  ipLog.set(ip, [...hits, now])
  return false
}

export async function POST(request) {
  // ── Rate limit ──
  const forwarded = request.headers.get('x-forwarded-for')
  const ip        = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  if (isRateLimited(ip)) {
    return Response.json({ success: false }, { status: 429 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false }, { status: 400 })
  }

  const { password } = body ?? {}
  if (!password || typeof password !== 'string') {
    return Response.json({ success: false }, { status: 401 })
  }

  const expected = process.env.CASE_STUDY_PASSWORD
  if (!expected) {
    return Response.json({ success: false }, { status: 401 })
  }

  const attempt  = password.trim()
  const correct  = expected.trim()
  const authorized =
    attempt.length === correct.length &&
    timingSafeEqual(Buffer.from(attempt), Buffer.from(correct))

  return Response.json({ success: authorized }, { status: authorized ? 200 : 401 })
}
