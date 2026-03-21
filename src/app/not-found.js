import Link from 'next/link'

export const metadata = {
  title: '404 — Page not found | Ily Ameur',
}

export default function NotFound() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-6 p-8 text-center">
        <p className="hero-heading" style={{ color: 'var(--color-text-subtle)' }}>404</p>
        <p className="text-md" style={{ color: 'var(--color-text-secondary)' }}>
          This page doesn&apos;t exist.
        </p>
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
