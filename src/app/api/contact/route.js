import { Resend } from 'resend'
import { EMAIL_RE, CONTACT_MAX as MAX } from '@/lib/validation'
import { getClientIp, createRateLimiter } from '@/lib/api'

const resend = new Resend(process.env.RESEND_API_KEY)

// 5 requests per IP per hour. See lib/api.js for caveats around per-instance state.
const isRateLimited = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 })

export async function POST(request) {
  if (isRateLimited(getClientIp(request))) {
    return Response.json({ error: 'Too many requests' }, { status: 429 })
  }

  // ── Parse body ──
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Bad request' }, { status: 400 })
  }

  const { name, email, message } = body ?? {}

  // Sanitize first so length checks measure the value we'll actually send.
  const safeName    = (name ?? '').replace(/[\r\n]/g, ' ').trim()
  const safeEmail   = (email ?? '').replace(/[\r\n]/g, ' ').trim()
  const safeMessage = (message ?? '').replace(/[\r\n]{3,}/g, '\n\n').trim()

  if (!safeName || !safeEmail || !safeMessage) {
    return Response.json({ error: 'Missing fields' }, { status: 400 })
  }

  if (safeName.length > MAX.name || safeEmail.length > MAX.email || safeMessage.length > MAX.message) {
    return Response.json({ error: 'Input too long' }, { status: 400 })
  }

  if (!EMAIL_RE.test(safeEmail)) {
    return Response.json({ error: 'Invalid email' }, { status: 400 })
  }

  const { error } = await resend.emails.send({
    from:    'Contact Form <contact@ily2a.net>',
    to:      'contact@ily2a.net',
    replyTo: safeEmail,
    subject: `New message from ${safeName}`,
    text:    `Name: ${safeName}\nEmail: ${safeEmail}\n\n${safeMessage}`,
  })

  if (error) {
    return Response.json({ error: 'Failed to send message' }, { status: 500 })
  }

  return Response.json({ success: true })
}
