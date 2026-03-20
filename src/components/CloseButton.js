'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function CloseButton({ onClick }) {
  const states = {
    default: {
      background: '#f6f6f9',
      borderColor: '#6c6284',
      boxShadow: 'none',
      fill: '#6c6284',
    },
    hover: {
      background: '#dedee8',
      borderColor: '#484257',
      boxShadow: 'none',
      fill: '#484257',
    },
    pressed: {
      background: '#6c6284',
      borderColor: '#f6f6f9',
      boxShadow: 'inset 0px -3px 3px rgba(0,0,0,0.25), inset 0px 2px 3px rgba(0,0,0,0.25)',
      fill: '#f6f6f9',
    },
  }

  const [state, setState] = useState('default')

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setState('hover')}
      onHoverEnd={() => setState('default')}
      onTapStart={() => setState('pressed')}
      onTap={() => setState('hover')}
      onTapCancel={() => setState('default')}
      animate={{
        background: states[state].background,
        borderColor: states[state].borderColor,
        boxShadow: states[state].boxShadow,
      }}
      transition={{ type: 'spring', stiffness: 2000, damping: 110, mass: 1 }}
      style={{
        width: '32px',
        height: '32px',
        minWidth: '32px',
        minHeight: '32px',
        borderRadius: '8px',
        border: '2px solid',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: '0',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M18.1161 4.11612C18.6043 3.62796 19.3955 3.62796 19.8837 4.11612C20.3719 4.60427 20.3719 5.39554 19.8837 5.88369L13.7675 11.9999L19.8837 18.1161C20.3719 18.6043 20.3719 19.3955 19.8837 19.8837C19.3955 20.3719 18.6043 20.3719 18.1161 19.8837L11.9999 13.7675L5.88369 19.8837C5.39554 20.3719 4.60427 20.3719 4.11612 19.8837C3.62796 19.3955 3.62796 18.6043 4.11612 18.1161L10.2323 11.9999L4.11612 5.88369C3.62796 5.39554 3.62796 4.60427 4.11612 4.11612C4.60427 3.62796 5.39554 3.62796 5.88369 4.11612L11.9999 10.2323L18.1161 4.11612Z"
          fill={states[state].fill}
        />
      </svg>
    </motion.button>
  )
}