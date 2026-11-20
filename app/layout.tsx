import type { Metadata } from 'next'
import './globals.css'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { ScrollRestoration } from '@/components/ScrollRestoration'
import { Analytics, GtmNoScript } from '@/components/Analytics'
import { CookieConsent } from '@/components/CookieConsent'
import { GlobalLeadmagnetTeaser } from '@/components/GlobalLeadmagnetTeaser'
import { JsonLd, globalGraph } from '@/lib/schema'

const faviconSvg = '/images/favicon.svg'
const defaultOgImage = 'https://cloud.fracto.live/s/a4CyLxG27RgGjRJ/preview'

export const metadata: Metadata = {
  metadataBase: new URL('https://lukasebner.de'),
  alternates: {
    canonical: 'https://lukasebner.de',
  },
  title: 'Lukas Ebner',
  authors: [{ name: 'Lukas Ebner', url: 'https://lukasebner.de/ueber-mich' }],
  creator: 'Lukas Ebner',
  publisher: 'Wachstumscoach GmbH',
  description: 'Lukas Ebner, Unternehmensberater in Regensburg (Wachstumscoach GmbH): Operations, Prozesse, Führung und KI für Geschäftsführer im Mittelstand.',
  icons: {
    icon: [{ url: faviconSvg, type: 'image/svg+xml' }],
    apple: faviconSvg,
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    siteName: 'Lukas Ebner',
    url: 'https://lukasebner.de',
    title: 'Lukas Ebner',
    description: 'Lukas Ebner, Unternehmensberater in Regensburg (Wachstumscoach GmbH): Operations, Prozesse, Führung und KI für Geschäftsführer im Mittelstand.',
    images: [{ url: defaultOgImage }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lukas Ebner',
    description: 'Lukas Ebner, Unternehmensberater in Regensburg (Wachstumscoach GmbH): Operations, Prozesse, Führung und KI für Geschäftsführer im Mittelstand.',
    images: [defaultOgImage],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className="h-full">
      <head>
        <Analytics />
        <JsonLd data={globalGraph()} />
      </head>
      <body className="flex min-h-full flex-col">
        <GtmNoScript />
        <ScrollRestoration />
        <Navigation />
        <div className="flex-1">{children}</div>
        <GlobalLeadmagnetTeaser />
        <Footer />
        <CookieConsent />
      </body>
    </html>
  )
}
