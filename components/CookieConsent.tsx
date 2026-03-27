'use client'

import { useEffect, useState } from 'react'

type ConsentChoice = 'all' | 'necessary' | null

const CONSENT_KEY = 'ebner_cookie_consent'

/**
 * Updates Google Consent Mode v2 based on the user's cookie choice.
 */
function updateGoogleConsent(choice: 'all' | 'necessary') {
  if (typeof window === 'undefined') return

  const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void }
  w.dataLayer = w.dataLayer || []
  function gtag(...args: unknown[]) {
    w.dataLayer!.push(args)
  }

  if (choice === 'all') {
    gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    })
  }
  // 'necessary' keeps the defaults (all denied) — no update needed
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Check if user already made a choice
    try {
      const stored = localStorage.getItem(CONSENT_KEY) as ConsentChoice
      if (stored === 'all' || stored === 'necessary') {
        // Re-apply consent on page load
        updateGoogleConsent(stored)
        return
      }
    } catch {
      // localStorage not available
    }

    // No choice yet — show banner after a short delay (avoid layout shift)
    const timer = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(timer)
  }, [])

  function handleChoice(choice: 'all' | 'necessary') {
    updateGoogleConsent(choice)
    try {
      localStorage.setItem(CONSENT_KEY, choice)
    } catch {
      // Silently fail if localStorage unavailable
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] border-t border-white/10 bg-surface-dark/95 backdrop-blur-md"
      role="dialog"
      aria-label="Cookie-Einstellungen"
    >
      <div className="mx-auto flex max-w-[1600px] flex-col items-start gap-4 px-8 py-6 sm:flex-row sm:items-center sm:gap-8 lg:px-20">
        <p className="flex-1 font-body text-sm leading-relaxed text-text-light/70">
          Diese Website verwendet Cookies für Analyse und Werbung.
          Mehr dazu in der{' '}
          <a href="/datenschutz" className="underline underline-offset-2 hover:text-text-light">
            Datenschutzerklärung
          </a>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={() => handleChoice('necessary')}
            className="rounded-full border border-white/20 px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-text-light/70 transition-colors hover:border-white/40 hover:text-text-light"
          >
            Nur notwendige
          </button>
          <button
            onClick={() => handleChoice('all')}
            className="rounded-full bg-brand px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-white transition-opacity hover:opacity-90"
          >
            Alle akzeptieren
          </button>
        </div>
      </div>
    </div>
  )
}
