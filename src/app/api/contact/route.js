import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX = { name: 100, email: 254, message: 5000 }

export async function POST(request) {
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

  const safeName = name.replace(/[\r\n]/g, ' ').trim()

  const { error } = await resend.emails.send({
    from: 'Contact Form <contact@ily2a.net>',
    to: 'contact@ily2a.net',
    replyTo: email,
    subject: `New message from ${safeName}`,
    text: `Name: ${safeName}\nEmail: ${email}\n\n${message}`,
  })

  if (error) {
    return Response.json({ error: 'Failed to send message' }, { status: 500 })
  }

  return Response.json({ success: true })
}
