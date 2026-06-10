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
export function getClientIp(request: Request): string {
  // x-real-ip is platform-set on Vercel and not client-spoofable — trust it
  // first. x-forwarded-for is a best-effort fallback for non-Vercel hosts and
  // IS spoofable, so it must not be relied on for authoritative decisions.
  // Use `||` (not `??`) so a present-but-empty header (e.g. "" or a leading
  // comma) falls through to 'unknown' instead of bucketing every blank-header
  // request into a single shared rate-limit key.
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || 'unknown'
}

interface RateLimiterOptions {
  limit: number
  windowMs: number
}

/**
 * Creates an in-memory sliding-window rate limiter.
 *
 * Per-instance: each serverless instance has its own Map, so concurrent
 * Vercel instances limit independently. Acceptable for low-traffic portfolio
 * use; replace with Upstash KV / Vercel KV if abuse becomes real.
 *
 * Returns a predicate that is true when the IP is over the limit.
 */
export function createRateLimiter({ limit, windowMs }: RateLimiterOptions): (ip: string) => boolean {
  const ipLog = new Map<string, number[]>()
  return function isRateLimited(ip: string): boolean {
    const now  = Date.now()
    const hits = (ipLog.get(ip) ?? []).filter(t => now - t < windowMs)
    if (hits.length >= limit) { ipLog.set(ip, hits); return true }
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
export function timingSafeStringEqual(attempt: unknown, expected: unknown): boolean {
  if (typeof attempt !== 'string' || typeof expected !== 'string') return false
  const expectedBuf = Buffer.from(expected)
  const attemptBuf  = Buffer.alloc(expectedBuf.length)
  Buffer.from(attempt).copy(attemptBuf, 0, 0, expectedBuf.length)
  const lengthMatch = attempt.length === expected.length
  const bytesMatch  = timingSafeEqual(attemptBuf, expectedBuf)
  return lengthMatch && bytesMatch
}
