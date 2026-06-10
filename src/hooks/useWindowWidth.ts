'use client'

import { useSyncExternalStore } from 'react'

// Module-level singleton — one shared resize listener regardless of how many
// components call useWindowWidth(). Previously each call created its own listener.

let currentWidth = typeof window !== 'undefined' ? window.innerWidth : 0
const listeners = new Set<() => void>()
let debounceTimer: ReturnType<typeof setTimeout>

if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    // Skip work when nothing is mounted — the listener stays attached for the
    // lifetime of the page (singleton), but there's no reason to run a debounced
    // innerWidth read + fanout when no component is subscribed.
    if (listeners.size === 0) return
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      currentWidth = window.innerWidth
      listeners.forEach(fn => fn())
    }, 100)
  })
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

export function useWindowWidth(): number {
  return useSyncExternalStore(
    subscribe,
    () => currentWidth,
    () => 0, // server snapshot
  )
}
