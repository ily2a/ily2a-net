'use client'

import Link from 'next/link'
import FloatingNav from '@/components/nav/FloatingNav'
import SilentErrorBoundary from '@/components/errors/SilentErrorBoundary'

export default function Error({ error: _error, reset }) {
  return (
    <main id="main-content" className="flex items-center justify-center min-h-screen">
      <SilentErrorBoundary><FloatingNav /></SilentErrorBoundary>
      <div className="flex flex-col items-center gap-6 p-8 text-center">
        <h1 className="heading-error text-text-primary">
          Something broke on our end.<br />
          Try refreshing or head back home.
        </h1>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="btn-label text-brand underline"
          >
            Try again
          </button>
          <Link
            href="/"
            className="btn-label text-brand underline"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  )
}
