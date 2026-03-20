'use client'

export default function Error({ reset }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '16px',
      color: '#F3F5F6',
    }}>
      <p className="text-md">Something went wrong.</p>
      <button
        onClick={reset}
        className="btn-label"
        style={{
          background: 'rgba(211, 209, 224, 0.1)',
          border: '1px solid rgba(211, 209, 224, 0.2)',
          borderRadius: '8px',
          padding: '8px 16px',
          color: '#F3F5F6',
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  )
}
