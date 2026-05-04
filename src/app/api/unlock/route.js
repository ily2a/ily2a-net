import { getClientIp, createRateLimiter, timingSafeStringEqual } from '@/lib/api'

// 10 attempts per IP per hour — tighter than contact (5/hr) since this is auth.
const isRateLimited = createRateLimiter({ limit: 10, windowMs: 60 * 60 * 1000 })

// Hard cap on raw POST body. The expected payload is `{ "password": "..." }`
// where the password itself is well under 200 chars; 4 000 covers any envelope
// or whitespace overhead while cutting off oversized payloads before JSON.parse.
const MAX_BODY_CHARS = 4_000

export async function POST(request) {
  if (isRateLimited(getClientIp(request))) {
    return Response.json({ success: false }, { status: 429 })
  }

  let raw
  try {
    raw = await request.text()
  } catch {
    return Response.json({ success: false }, { status: 400 })
  }
  if (raw.length > MAX_BODY_CHARS) {
    return Response.json({ success: false }, { status: 413 })
  }

  let body
  try {
    body = JSON.parse(raw)
  } catch {
    return Response.json({ success: false }, { status: 400 })
  }

  const { password } = body ?? {}
  if (!password || typeof password !== 'string') {
    return Response.json({ success: false }, { status: 400 })
  }

  const expected = process.env.CASE_STUDY_PASSWORD
  if (!expected) {
    console.error('[/api/unlock] CASE_STUDY_PASSWORD is not set')
    return Response.json({ success: false }, { status: 500 })
  }

  if (!timingSafeStringEqual(password, expected)) {
    return Response.json({ success: false }, { status: 401 })
  }

  return Response.json({ success: true }, { status: 200 })
}
