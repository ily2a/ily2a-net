'use client'

import Link from 'next/link'
import FloatingNav from '@/components/FloatingNav'

export default function Error({ error: _error, reset }) {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <FloatingNav />
      <div className="flex flex-col items-center gap-6 p-8 text-center">
        <h1 role="alert" className="font-light tracking-[0.06em] leading-[140%] text-[24px] md:text-[26px] lg:text-[28px] xl:text-[32px] text-balance text-text-primary">
          Something broke on our end.<br />
          Try refreshing or head back home.
        </h1>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="font-bold tracking-[-0.01em] leading-[120%] text-[16px] lg:text-[18px] text-balance text-brand underline"
          >
            Try again
          </button>
          <Link
            href="/"
            className="font-bold tracking-[-0.01em] leading-[120%] text-[16px] lg:text-[18px] text-balance text-brand underline"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  )
}
