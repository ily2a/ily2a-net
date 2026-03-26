'use client'

import { Component } from 'react'

/**
 * SilentErrorBoundary prevents a broken subtree from replacing the whole page.
 * We use it for background/live-preview components (e.g. SanityLive), so indexing
 * and real content rendering remain stable even if live preview fails (CORS, etc).
 */
export default class SilentErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // Keep logging for debugging, but don't render a full-page error.
    console.error('[SilentErrorBoundary caught]:', error, info?.componentStack)
  }

  render() {
    if (this.state.hasError) return null
    return <>{this.props.children}</>
  }
}

