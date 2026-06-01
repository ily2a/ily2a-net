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
  // Underflow guard — extra pops are a programmer error (or hot-reload race)
  // and must not fire a 1→0 notify when the count was already 0. Subscribers
  // wake heavy WebGL loops on that edge; redundant notifies cause spurious
  // resumes during a teardown.
  if (openCount === 0) return
  openCount -= 1
  if (openCount === 0) notify()
}

// Exposed for tests and any non-React subscriber that needs to react to the
// modal-open edge transitions (0→1, 1→0). React components should use the
// `useModalOpen` hook below.
export function subscribeToModalOpen(callback) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

// Current open state, for non-React subscribers (e.g. a WebGL RAF loop set up
// in a mount-only effect that can't call the hook). subscribeToModalOpen only
// reports edges, so subscribers read this to learn the value on each notify.
export function getModalOpen() {
  return openCount > 0
}

function subscribe(callback) {
  return subscribeToModalOpen(callback)
}

export function useModalOpen() {
  return useSyncExternalStore(
    subscribe,
    () => openCount > 0,
    () => false,
  )
}
