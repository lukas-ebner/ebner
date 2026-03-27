'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { captureUtmParams } from '@/lib/utm'

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

/**
 * Analytics component — loaded in RootLayout.
 *
 * 1. Sets Google Consent Mode v2 defaults (all denied)
 * 2. Loads Google Tag Manager
 * 3. Captures UTM parameters from URL into sessionStorage
 *
 * GTM tags (GA4, Ads Conversion) are configured in the GTM web interface.
 * They only fire after the CookieConsent component grants consent.
 */
export function Analytics() {
  // Capture UTM params on mount
  useEffect(() => {
    captureUtmParams()
  }, [])

  if (!GTM_ID) return null

  return (
    <>
      {/* Consent Mode v2 defaults — MUST load before GTM */}
      <Script id="consent-defaults" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'wait_for_update': 500
          });
        `}
      </Script>

      {/* Google Tag Manager */}
      <Script id="gtm-script" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');
        `}
      </Script>
    </>
  )
}

/**
 * GTM noscript fallback — must be placed right after <body>.
 */
export function GtmNoScript() {
  if (!GTM_ID) return null

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}
