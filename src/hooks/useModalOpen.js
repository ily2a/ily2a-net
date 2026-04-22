'use client'

import { useSyncExternalStore } from 'react'

// Module-level singleton tracking whether any blocking modal is open.
// Heavy background renderers (WebGL canvases) subscribe so they can pause
// their RAF loops while occluded — IntersectionObserver doesn't fire for
// covered elements, only off-screen ones.

let openCount = 0
const listeners = new Set()

function notify() {
  listeners.forEach(fn => fn())
}

export function pushModalOpen() {
  openCount += 1
  if (openCount === 1) notify()
}

export function popModalOpen() {
  openCount = Math.max(0, openCount - 1)
  if (openCount === 0) notify()
}

function subscribe(callback) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

export function useModalOpen() {
  return useSyncExternalStore(
    subscribe,
    () => openCount > 0,
    () => false,
  )
}

export function isModalOpen() {
  return openCount > 0
}
