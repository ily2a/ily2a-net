'use client'

import { useSyncExternalStore } from 'react'
import { subscribeToModalOpen, getModalOpen } from '@/lib/modal-store'

// The modal-open singleton lives in @/lib/modal-store (framework-agnostic).
// Re-exported here so existing imports of the store API from this module keep
// resolving; imperative non-React consumers should import from the lib module.
export { pushModalOpen, popModalOpen, subscribeToModalOpen, getModalOpen } from '@/lib/modal-store'

export function useModalOpen(): boolean {
  return useSyncExternalStore(subscribeToModalOpen, getModalOpen, () => false)
}
