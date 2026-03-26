'use client'

import { useEffect } from 'react'

/** Adds `no-snap` class to <html> while mounted, removing scroll-snap on the page. */
export function NoSnap() {
  useEffect(() => {
    document.documentElement.classList.add('no-snap')
    return () => {
      document.documentElement.classList.remove('no-snap')
    }
  }, [])
  return null
}
