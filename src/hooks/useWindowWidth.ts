'use client'

import { useSyncExternalStore } from 'react'

// Module-level singleton — one shared resize listener regardless of how many
// components call useWindowWidth(). Previously each call created its own listener.

let currentWidth = typeof window !== 'undefined' ? window.innerWidth : 0
const listeners = new Set<() => void>()
let debounceTimer: ReturnType<typeof setTimeout>

if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    // Keep the snapshot fresh even with no subscribers, so a component mounting
    // after a resize (e.g. on /studio, or during a Suspense fallback) reads the
    // correct width instead of a stale one until the next resize. The read is
    // cheap; only the debounced fanout is gated on having subscribers.
    currentWidth = window.innerWidth
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
