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
  if (!hits.length) { ipLog.delete(ip) }
  if (hits.length >= RATE_LIMIT) return true
  ipLog.set(ip, [...hits, now])
  return false
}

export async function POST(request) {
  // ── Rate limit ──
  const ip = request.headers.get('x-real-ip')
          ?? request.headers.get('x-forwarded-for')?.split(',')[0].trim()
          ?? 'unknown'
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

  const attempt    = password.trim()
  const correct    = expected.trim()
  // Always run timingSafeEqual regardless of length — prevents timing-based
  // length oracle attacks. Pad attempt into a fixed-size buffer matching correct.
  const correctBuf = Buffer.from(correct)
  const attemptBuf = Buffer.alloc(correctBuf.length)
  Buffer.from(attempt).copy(attemptBuf, 0, 0, correctBuf.length)
  const lengthMatch = attempt.length === correct.length
  const bytesMatch  = timingSafeEqual(attemptBuf, correctBuf)
  const authorized  = lengthMatch && bytesMatch

  return Response.json({ success: authorized }, { status: authorized ? 200 : 401 })
}
