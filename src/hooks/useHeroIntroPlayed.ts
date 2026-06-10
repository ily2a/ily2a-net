import { useSyncExternalStore } from 'react'

const KEY = 'hero_intro_played'

// Module-level cache — persists across client-side navigation within the same
// JS session, so re-mounts read `true` and there's no flash.
// Hydrated from sessionStorage at module init so a hard refresh within a tab
// session also correctly skips the intro.
// Note: this flag persists across HMR in dev (module state survives hot reload),
// so animations won't replay after a save — clear sessionStorage to reset manually.
let _played = false
if (typeof window !== 'undefined' && sessionStorage.getItem(KEY) === '1') {
  _played = true
}

// useSyncExternalStore avoids the setState-in-effect anti-pattern. The store
// is read-only from React's perspective; subscribe() handles the one-shot
// "mark this session as played" side effect on first mount.
const subscribe = (): (() => void) => {
  if (!_played && typeof window !== 'undefined') {
    sessionStorage.setItem(KEY, '1')
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
