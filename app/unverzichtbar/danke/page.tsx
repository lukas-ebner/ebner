import type { Metadata } from 'next'
import Link from 'next/link'
import { DoiConversionPing } from './DoiConversionPing'

export const metadata: Metadata = {
  title: 'Danke – dein Buch ist unterwegs | Lukas Ebner',
  description:
    'Deine Bestätigung ist angekommen. Innerhalb weniger Minuten bekommst du eBook, PDF und Audiobook von „(Un)verzichtbar" in dein Postfach.',
  alternates: { canonical: 'https://lukasebner.de/unverzichtbar/danke' },
  robots: { index: false, follow: false },
}

export default function DankePage() {
  return (
    <main className="bg-surface-dark text-white">
      <DoiConversionPing />
      <section className="relative min-h-[70vh] pt-28 lg:pt-32">
        <div className="mx-auto flex max-w-3xl flex-col items-start justify-center px-6 py-20 lg:px-8 lg:py-28">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand">
            Bestätigt · Check dein Postfach
          </p>
          <h1 className="mt-5 font-display text-4xl leading-[1.05] lg:text-[3.25rem]">
            Dein Buch ist unterwegs.
          </h1>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-white/80">
            <p>
              Du bekommst in den nächsten Minuten eine E-Mail mit drei Download-Links — eBook, PDF
              und Audiobook. Lad dir alle drei herunter; die Links sind 7 Tage gültig.
            </p>
            <p>
              In den nächsten Wochen schicke ich dir ein paar kurze Notizen zum Buch — was Thomas
              gerade durchmacht, warum der Mittelteil der härteste ist, wo du dich vermutlich
              wiedererkennst. Kein Newsletter-Zwang; jederzeit abbestellbar.
            </p>
            <p className="rounded-lg border-l-4 border-brand bg-white/5 p-5 text-base italic">
              Falls die Mail nicht ankommt: Check den Spam-Ordner, und trag{' '}
              <span className="font-mono text-brand">lukas@lukasebner.de</span> als vertrauenswürdigen
              Absender ein.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/erstgespraech"
              className="rounded-full bg-brand px-6 py-3 font-mono text-xs uppercase tracking-wide text-white transition-opacity hover:opacity-90"
            >
              Erstgespräch buchen
            </Link>
            <Link
              href="/"
              className="rounded-full border border-white/30 px-6 py-3 font-mono text-xs uppercase tracking-wide text-white/90 transition-colors hover:border-white/60"
            >
              Zur Startseite
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
