import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i
const MAX = { name: 100, email: 254, message: 5000 }

// ── Rate limiting ──────────────────────────────────────────────────────────────
// In-memory sliding window: 5 requests per IP per hour.
// Note: resets on cold start AND is per-instance — on Vercel, concurrent
// serverless instances each have isolated memory, so this is best-effort.
// Sufficient for a low-traffic portfolio; replace with Upstash KV if spam
// becomes a real issue.
const RATE_LIMIT  = 5
const WINDOW_MS   = 60 * 60 * 1000 // 1 hour

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

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return Response.json({ error: 'Missing fields' }, { status: 400 })
  }

  if (name.length > MAX.name || email.length > MAX.email || message.length > MAX.message) {
    return Response.json({ error: 'Input too long' }, { status: 400 })
  }

  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: 'Invalid email' }, { status: 400 })
  }

  // ── Sanitize inputs ──
  const safeName    = name.replace(/[\r\n]/g, ' ').trim()
  const safeEmail   = email.replace(/[\r\n]/g, ' ').trim()
  const safeMessage = message.replace(/[\r\n]{3,}/g, '\n\n').trim()

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
