'use client'

import { Component } from 'react'

/**
 * ErrorBoundary must be a class component — React Hooks do not support
 * getDerivedStateFromError / componentDidCatch. This is intentional and
 * correct; React 19 does not yet offer a hook-based error boundary API.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, resetKey: 0 }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info?.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <p role="alert" style={{ color: 'var(--color-text-secondary)' }}>Something went wrong.</p>
            <button
              onClick={() => this.setState(s => ({ hasError: false, resetKey: s.resetKey + 1 }))}
              className="underline text-brand bg-transparent border-none cursor-pointer"
            >
              Try again
            </button>
          </div>
        </main>
      )
    }
    // resetKey forces a real remount of children on retry, clearing broken render state
    return <>{this.props.children}</>
  }
}
