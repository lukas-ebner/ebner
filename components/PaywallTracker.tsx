'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { trackLeadtimeEvent } from '@/lib/leadtime-tracking'

export function PaywallTracker() {
  const pathname = usePathname()
  const trackedRef = useRef(false)

  useEffect(() => {
    if (pathname !== '/preise' || trackedRef.current) return
    trackedRef.current = true
    trackLeadtimeEvent(
      'lt_paywall_impression',
      { paywall_surface: 'preise_page' },
      { pathVariant: 'self_serve' }
    )
  }, [pathname])

  return null
}
