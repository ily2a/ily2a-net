import { useState, useEffect } from 'react'

const KEY = 'hero_intro_played'

// Module-level cache — persists across client-side navigation within the same
// JS session, so useState initialises to true on re-mount and there's no flash.
// Note: this flag persists across HMR in dev (module state survives hot reload),
// so animations won't replay after a save — clear sessionStorage to reset manually.
let _played = false

export function useHeroIntroPlayed() {
  const [played, setPlayed] = useState(_played)

  useEffect(() => {
    if (_played) return
    if (sessionStorage.getItem(KEY) === '1') {
      _played = true
      setPlayed(true)
    } else {
      sessionStorage.setItem(KEY, '1')
      _played = true
    }
  }, [])

  return played
}
