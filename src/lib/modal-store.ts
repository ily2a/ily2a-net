// Framework-agnostic singleton tracking whether any blocking modal is open.
// No React, no 'use client' — heavy background renderers (WebGL canvases) set up
// in mount-only effects subscribe imperatively so they can pause their RAF loops
// while occluded (IntersectionObserver doesn't fire for covered elements, only
// off-screen ones). The sole consumer today is useWebGLBackground, which calls
// subscribeToModalOpen/getModalOpen directly; a React component could also bind
// this via useSyncExternalStore(subscribeToModalOpen, getModalOpen, () => false).

let openCount = 0
const listeners = new Set<() => void>()

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

// Subscribe to the modal-open edge transitions (0→1, 1→0). Returns an
// unsubscribe function. subscribeToModalOpen only reports edges, so subscribers
// read getModalOpen() on each notify to learn the current value.
export function subscribeToModalOpen(callback: () => void): () => void {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

export function getModalOpen(): boolean {
  return openCount > 0
}
