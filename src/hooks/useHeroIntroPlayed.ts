import { useSyncExternalStore } from 'react'

const KEY = 'hero_intro_played'

// Storage access can THROW (not just return null): Chrome "block all cookies",
// sandboxed iframes without allow-same-origin, etc. raise SecurityError on the
// mere property access. This module is imported on every route, so an unguarded
// throw here would abort chunk init and leave the whole site non-interactive.
// Wrap both sides so a storage failure falls back to the in-memory flag only.
function safeGet(key: string): string | null {
  try { return sessionStorage.getItem(key) } catch { return null }
}
function safeSet(key: string, value: string): void {
  try { sessionStorage.setItem(key, value) } catch { /* storage blocked — in-memory only */ }
}

// Module-level cache — persists across client-side navigation within the same
// JS session, so re-mounts read `true` and there's no flash.
// Hydrated from sessionStorage at module init so a hard refresh within a tab
// session also correctly skips the intro.
// Note: this flag persists across HMR in dev (module state survives hot reload),
// so animations won't replay after a save — clear sessionStorage to reset manually.
let _played = false
if (typeof window !== 'undefined' && safeGet(KEY) === '1') {
  _played = true
}

// useSyncExternalStore avoids the setState-in-effect anti-pattern. The store
// is read-only from React's perspective; subscribe() handles the one-shot
// "mark this session as played" side effect on first mount.
const subscribe = (): (() => void) => {
  if (!_played && typeof window !== 'undefined') {
    safeSet(KEY, '1')
    // Mutate without notifying — the current mount keeps rendering `false`
    // so the animation plays once; future mounts read the new value via
    // getSnapshot() and skip the animation.
    _played = true
  }
  return () => {}
}
const getSnapshot       = (): boolean => _played
const getServerSnapshot = (): boolean => false

export function useHeroIntroPlayed(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
