'use client'

import dynamic from 'next/dynamic'

// ssr: false — PasswordGate reads sessionStorage on init to avoid the
// one-frame flash of the gate on pages the user has already unlocked.
// Must live in a Client Component; ssr:false is not allowed in Server Components.
export default dynamic(() => import('@/components/PasswordGate'), { ssr: false })
