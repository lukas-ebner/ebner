import type { Metadata } from 'next'
import './globals.css'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { ScrollRestoration } from '@/components/ScrollRestoration'
import { Analytics, GtmNoScript } from '@/components/Analytics'
import { CookieConsent } from '@/components/CookieConsent'

const faviconSvg = '/images/favicon.svg'
const defaultOgImage = 'https://cloud.fracto.live/s/a4CyLxG27RgGjRJ'

export const metadata: Metadata = {
  metadataBase: new URL('https://lukasebner.de'),
  alternates: {
    canonical: 'https://lukasebner.de',
  },
  title: 'Lukas Ebner',
  description: 'Unternehmensberatung für KMU',
  icons: {
    icon: [{ url: faviconSvg, type: 'image/svg+xml' }],
    apple: faviconSvg,
  },
  openGraph: {
    type: 'website',
    url: 'https://lukasebner.de',
    title: 'Lukas Ebner',
    description: 'Unternehmensberatung für KMU',
    images: [{ url: defaultOgImage }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lukas Ebner',
    description: 'Unternehmensberatung für KMU',
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
      </head>
      <body className="flex min-h-full flex-col">
        <GtmNoScript />
        <ScrollRestoration />
        <Navigation />
        <div className="flex-1">{children}</div>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  )
}
