import { createHmac, randomBytes } from 'crypto'

// Helpers for the in-memory request-dedup used by `/api/contact`. Lifted into
// their own module so unit tests can target them directly without spinning up
// a NextRequest. The cache + HMAC secret live here as module singletons; the
// route imports the factory below to get its own scoped instance.

export const DEFAULT_DEDUP_TTL = 5 * 60 * 1000

export function dedupKey(secret: string, email: string, message: string): string {
  return createHmac('sha256', secret)
    .update(`${email}\n${message}`)
    .digest('base64url')
    .slice(0, 22)
}

interface DedupCacheOptions {
  ttl?: number
  now?: () => number
}

export interface DedupCache {
  isDuplicate: (key: string) => boolean
  markSent: (key: string) => void
  cache: Map<string, number>
}

// Returns a peek/commit pair sharing a single Map. Peek-and-evict short-
// circuits on hits so a hot duplicate doesn't trigger an O(n) walk. Commit
// runs only after the caller confirms the side effect succeeded — peek-time
// insertion would poison the cache when the side effect (e.g. Resend send)
// fails.
export function createDedupCache({ ttl = DEFAULT_DEDUP_TTL, now = Date.now }: DedupCacheOptions = {}): DedupCache {
  const cache = new Map<string, number>()

  function isDuplicate(key: string): boolean {
    const t = cache.get(key)
    if (t !== undefined && now() - t <= ttl) return true
    // Cache miss — opportunistic eviction so the map doesn't grow without bound.
    const cur = now()
    for (const [k, ts] of cache) {
      if (cur - ts > ttl) cache.delete(k)
    }
    return false
  }

  function markSent(key: string): void {
    cache.set(key, now())
  }

  return { isDuplicate, markSent, cache }
}

// Module-level singleton with HMAC secret resolved once. `randomBytes` keeps
// dev/single-instance safe; production sets DEDUP_SECRET so all warm lambdas
// in a deployment compute the same key for the same payload.
const DEDUP_SECRET = process.env.DEDUP_SECRET || randomBytes(32).toString('hex')
const singleton = createDedupCache()

export const contactDedup = {
  key: (email: string, message: string) => dedupKey(DEDUP_SECRET, email, message),
  isDuplicate: singleton.isDuplicate,
  markSent: singleton.markSent,
}
