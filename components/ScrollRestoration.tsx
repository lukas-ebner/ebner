'use client'

import { useEffect } from 'react'

/**
 * Fixes scroll-snap + browser back button issue:
 * When navigating back, the browser restores scroll position but
 * scroll-snap-type: proximity + smooth behavior causes it to snap
 * to the nearest section (often the hero). This temporarily disables
 * smooth scrolling on popstate so the browser can restore position exactly.
 */
export function ScrollRestoration() {
  useEffect(() => {
    // Tell the browser we handle scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'auto'
    }

    const handlePopState = () => {
      // Temporarily disable smooth scroll and snap so browser restores exact position
      document.documentElement.style.scrollBehavior = 'auto'
      document.documentElement.style.scrollSnapType = 'none'

      // Re-enable after browser has restored position
      requestAnimationFrame(() => {
        setTimeout(() => {
          document.documentElement.style.scrollBehavior = ''
          document.documentElement.style.scrollSnapType = ''
        }, 100)
      })
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return null
}
