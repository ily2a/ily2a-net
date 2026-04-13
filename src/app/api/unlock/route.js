import { getClientIp, createRateLimiter, timingSafeStringEqual } from '@/lib/api'

// 10 attempts per IP per hour — tighter than contact (5/hr) since this is auth.
const isRateLimited = createRateLimiter({ limit: 10, windowMs: 60 * 60 * 1000 })

export async function POST(request) {
  if (isRateLimited(getClientIp(request))) {
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
    return Response.json({ success: false }, { status: 400 })
  }

  const expected = process.env.CASE_STUDY_PASSWORD
  if (!expected) {
    console.error('[/api/unlock] CASE_STUDY_PASSWORD is not set')
    return Response.json({ success: false }, { status: 500 })
  }

  if (!timingSafeStringEqual(password.trim(), expected.trim())) {
    return Response.json({ success: false }, { status: 401 })
  }

  return Response.json({ success: true }, { status: 200 })
}
