import type { Metadata } from 'next'
import { NoSnap } from './NoSnap'

export const metadata: Metadata = {
  title: 'HundeWelt – Alles über unsere treuen Begleiter',
  description:
    'Entdecke Hunderassen, Pflegetipps und spannende Fakten über Hunde. Deine Lieblings-Website für alle Hundefreunde.',
  alternates: { canonical: 'https://lukasebner.de/hunde' },
  openGraph: {
    title: 'HundeWelt – Alles über unsere treuen Begleiter',
    description:
      'Entdecke Hunderassen, Pflegetipps und spannende Fakten über Hunde.',
    url: 'https://lukasebner.de/hunde',
  },
}

export default function HundeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NoSnap />
      {children}
    </>
  )
}
