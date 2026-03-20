'use client'

import { useState, useEffect } from 'react'

export function useWindowWidth() {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    setWidth(window.innerWidth)

    let timer
    const handler = () => {
      clearTimeout(timer)
      timer = setTimeout(() => setWidth(window.innerWidth), 100)
    }

    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('resize', handler)
      clearTimeout(timer)
    }
  }, [])

  return width
}
