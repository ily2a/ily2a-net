'use client'

import Link from 'next/link'

export default function Error({ reset }) {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-6 p-8 text-center">
        <p role="alert" className="text-md" style={{ color: 'var(--color-text-secondary)' }}>
          Something went wrong.
        </p>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="btn-label"
            style={{ color: 'var(--color-brand)', textDecoration: 'underline' }}
          >
            Try again
          </button>
          <Link
            href="/"
            className="btn-label"
            style={{ color: 'var(--color-text-secondary)', textDecoration: 'underline' }}
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  )
}
