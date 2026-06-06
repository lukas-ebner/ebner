'use client'

import { useEffect } from 'react'

export function NoSnap() {
  useEffect(() => {
    document.documentElement.classList.add('no-snap')
    return () => document.documentElement.classList.remove('no-snap')
  }, [])
  return null
}
