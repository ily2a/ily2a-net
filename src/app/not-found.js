import Link from 'next/link'
import FloatingNav from '@/components/FloatingNav'

export const metadata = {
  title: '404 — Page not found | Ily Ameur',
}

export default function NotFound() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <FloatingNav />
      <div className="flex flex-col items-center gap-6 p-8 text-center">
        <h1 className="hero-sub-2" style={{ color: 'var(--color-text-primary)' }}>
          This page faded into the digital ether.<br />
          Hit the homepage and keep exploring.
        </h1>
        <Link
          href="/"
          className="btn-label"
          style={{ color: 'var(--color-brand)', textDecoration: 'underline' }}
        >
          Back home
        </Link>
      </div>
    </main>
  )
}
