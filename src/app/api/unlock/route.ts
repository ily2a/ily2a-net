import { getClientIp, createRateLimiter, timingSafeStringEqual } from '@/lib/api'

// 10 attempts per IP per hour — tighter than contact (5/hr) since this is auth.
// The per-IP throttle is per-instance and IP-trust depends on the platform
// setting x-real-ip (see getClientIp); on non-Vercel hosts x-forwarded-for is
// spoofable, so brute-force resistance ultimately rests on CASE_STUDY_PASSWORD
// being high-entropy. Keep that secret long/random, not a guessable phrase.
const isRateLimited = createRateLimiter({ limit: 10, windowMs: 60 * 60 * 1000 })

// Hard cap on raw POST body. The expected payload is `{ "password": "..." }`
// where the password itself is well under 200 chars; 4 000 covers any envelope
// or whitespace overhead while cutting off oversized payloads before JSON.parse.
const MAX_BODY_CHARS = 4_000

export async function POST(request: Request) {
  if (isRateLimited(getClientIp(request))) {
    return Response.json({ success: false }, { status: 429 })
  }

  let raw: string
  try {
    raw = await request.text()
  } catch {
    return Response.json({ success: false }, { status: 400 })
  }
  if (raw.length > MAX_BODY_CHARS) {
    return Response.json({ success: false }, { status: 413 })
  }

  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return Response.json({ success: false }, { status: 400 })
  }

  const { password } = (body ?? {}) as { password?: unknown }
  if (!password || typeof password !== 'string') {
    return Response.json({ success: false }, { status: 400 })
  }

  const expected = process.env.CASE_STUDY_PASSWORD
  if (!expected) {
    // Collapse server misconfiguration into the same 401 as a wrong password so
    // an unauthenticated caller can't distinguish "env var missing" from "wrong
    // password" (matches the revalidate route's convention). Log server-side only.
    console.error('[/api/unlock] CASE_STUDY_PASSWORD is not set')
    return Response.json({ success: false }, { status: 401 })
  }

  if (!timingSafeStringEqual(password, expected)) {
    return Response.json({ success: false }, { status: 401 })
  }

  return Response.json({ success: true }, { status: 200 })
}
