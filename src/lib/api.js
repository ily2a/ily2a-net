import { timingSafeEqual } from 'crypto'

// Shared API helpers used by route handlers under src/app/api/.
//
// Why these live here: rate-limiting + IP extraction + constant-time string
// comparison are security-relevant primitives that were previously copy-pasted
// across contact, unlock, and revalidate routes. A bug fixed in one copy used
// to silently miss the others — extracting them keeps behaviour consistent.

/**
 * Returns the client IP for a request.
 *
 * On Vercel, x-real-ip is set by the platform's edge and is not client-spoofable.
 * x-forwarded-for is included as a fallback for non-Vercel environments but
 * IS spoofable — bucketing on it is best-effort, not authoritative.
 */
export function getClientIp(request) {
  return (
    request.headers.get('x-real-ip')
    ?? request.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? 'unknown'
  )
}

/**
 * Creates an in-memory sliding-window rate limiter.
 *
 * Per-instance: each serverless instance has its own Map, so concurrent
 * Vercel instances limit independently. Acceptable for low-traffic portfolio
 * use; replace with Upstash KV / Vercel KV if abuse becomes real.
 *
 * @param {{ limit: number, windowMs: number }} opts
 * @returns {(ip: string) => boolean} returns true when the IP is over the limit
 */
export function createRateLimiter({ limit, windowMs }) {
  const ipLog = new Map()
  return function isRateLimited(ip) {
    const now  = Date.now()
    const hits = (ipLog.get(ip) ?? []).filter(t => now - t < windowMs)
    if (hits.length >= limit) return true
    ipLog.set(ip, [...hits, now])
    return false
  }
}

/**
 * Constant-time string comparison built on Node's timingSafeEqual.
 *
 * Pads the attempt buffer to the expected length so the underlying
 * comparison always runs against equal-size buffers (timingSafeEqual throws
 * otherwise). Length mismatch is reported via the boolean return without
 * leaking timing — the comparison still runs.
 *
 * Both arguments must be strings. Returns false for any non-string input.
 */
export function timingSafeStringEqual(attempt, expected) {
  if (typeof attempt !== 'string' || typeof expected !== 'string') return false
  // Fast-path: reject oversized inputs before any heap allocation.
  // No real password exceeds 1024 chars; this prevents a large-body heap spike.
  if (attempt.length > 1024) return false
  const expectedBuf = Buffer.from(expected)
  const attemptBuf  = Buffer.alloc(expectedBuf.length)
  Buffer.from(attempt).copy(attemptBuf, 0, 0, expectedBuf.length)
  const lengthMatch = attempt.length === expected.length
  const bytesMatch  = timingSafeEqual(attemptBuf, expectedBuf)
  return lengthMatch && bytesMatch
}
