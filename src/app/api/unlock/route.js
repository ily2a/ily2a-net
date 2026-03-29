import { timingSafeEqual } from 'crypto'

export async function POST(request) {
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
