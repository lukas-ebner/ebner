/**
 * UTM Parameter Capture & Retrieval
 *
 * Captures UTM parameters + gclid from the URL on page load,
 * persists them in sessionStorage, and provides a getter for form submissions.
 */

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid'] as const

export type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>

const STORAGE_KEY = 'ebner_utm'

/**
 * Capture UTM params from the current URL and store in sessionStorage.
 * Call this once on app mount (e.g., in a useEffect in layout or a client component).
 * Only overwrites if at least one UTM param is present in the URL (preserves earlier attribution).
 */
export function captureUtmParams(): void {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams(window.location.search)
  const utmData: UtmParams = {}
  let hasAny = false

  for (const key of UTM_KEYS) {
    const value = params.get(key)
    if (value) {
      utmData[key] = value
      hasAny = true
    }
  }

  if (hasAny) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utmData))
    } catch {
      // sessionStorage not available (private browsing etc.) — silently ignore
    }
  }
}

/**
 * Retrieve stored UTM params. Returns empty object if none captured.
 */
export function getUtmParams(): UtmParams {
  if (typeof window === 'undefined') return {}

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored) as UtmParams
  } catch {
    // Parse error or sessionStorage unavailable
  }

  return {}
}
