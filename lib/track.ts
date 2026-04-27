/**
 * Generic GTM/dataLayer event push for ad-conversion tracking.
 *
 * Use this for top-of-funnel + DOI/Conversion events fired from
 * landing-page forms and CTAs. The event names match the GA4 +
 * Google Ads Conversion-Action setup documented in
 * docs/tracking-setup.md.
 *
 * The Analytics component (components/Analytics.tsx) already loads
 * GTM with Consent Mode v2 defaults. CookieConsent grants/denies
 * storage; this helper just pushes events — GTM decides whether to
 * forward them to GA4/Google Ads based on consent state.
 */
import { getUtmParams } from '@/lib/utm'

export type ConversionEvent =
  | 'form_submit_unverzichtbar' // Step 1: signup form sent
  | 'doi_confirmed_unverzichtbar' // Step 2: DOI link clicked, lead created
  | 'form_submit_ebook' // Cost-of-Chaos ebook requested
  | 'erstgespraech_book_click' // CTA click towards booking page
  | 'erstgespraech_complete' // Application form submitted
  | 'freiheitstest_complete' // Quiz submitted, strategy paper requested

type TrackPayload = Record<string, unknown>

export function trackEvent(event: ConversionEvent, payload: TrackPayload = {}): void {
  if (typeof window === 'undefined') return
  const w = window as unknown as { dataLayer?: TrackPayload[] }
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push({
    event,
    ...getUtmParams(),
    ...payload,
  })
}
