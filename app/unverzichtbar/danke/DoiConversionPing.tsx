'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/track'

const FIRED_KEY = 'ebner_doi_unverzichtbar_fired'

/**
 * Fires `doi_confirmed_unverzichtbar` exactly once per session when the
 * /unverzichtbar/danke page is reached (= DOI link in confirmation
 * email was clicked, lead was created in Leadtime, redirect happened).
 *
 * Uses sessionStorage to prevent double-counting on hard reloads.
 */
export function DoiConversionPing() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(FIRED_KEY)) return
      sessionStorage.setItem(FIRED_KEY, '1')
    } catch {
      // proceed even if sessionStorage is blocked
    }
    trackEvent('doi_confirmed_unverzichtbar', { lead_magnet: 'unverzichtbar' })
  }, [])

  return null
}
