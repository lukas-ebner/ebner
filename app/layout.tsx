import type { Metadata } from 'next'
import './globals.css'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { ScrollRestoration } from '@/components/ScrollRestoration'

const faviconSvg = '/images/favicon.svg'

export const metadata: Metadata = {
  metadataBase: new URL('https://lukasebner.de'),
  title: 'Lukas Ebner',
  description: 'Unternehmensberatung für KMU',
  icons: {
    icon: [{ url: faviconSvg, type: 'image/svg+xml' }],
    apple: faviconSvg,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className="h-full">
      <body className="flex min-h-full flex-col">
        <ScrollRestoration />
        <Navigation />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
