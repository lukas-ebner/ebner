import type { Metadata } from 'next'
import Link from 'next/link'
import { listPublishedPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Seite nicht gefunden – Lukas Ebner',
  robots: { index: false, follow: true },
}

const destinations = [
  { href: '/', label: 'Startseite', desc: 'Unternehmensberatung für Geschäftsführer im Mittelstand' },
  { href: '/operations', label: 'Operations & Führung', desc: 'Prozesse, Rollen und Strukturen, die ohne dich laufen' },
  { href: '/ki-readiness', label: 'KI-Readiness', desc: 'KI im Mittelstand: von der Idee zum Prototyp' },
  { href: '/themen/bafa', label: 'BAFA-Förderung', desc: 'Wie die Förderung für Unternehmensberatung funktioniert' },
  { href: '/blog', label: 'Blog', desc: 'Alle Artikel zu Führung, Prozessen, KI und Exit' },
  { href: '/kontakt', label: 'Kontakt', desc: 'Schreib mir, wenn du etwas Bestimmtes suchst' },
]

export default function NotFound() {
  const latest = listPublishedPosts().slice(0, 3)
  return (
    <main className="bg-surface-light">
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-36 lg:pt-44">
        <p className="font-mono text-xs uppercase tracking-widest text-text-dimmed">Fehler 404</p>
        <h1 className="mt-4 font-display text-h2 font-normal text-text-primary">
          Diese Seite gibt es nicht (mehr).
        </h1>
        <p className="mt-4 max-w-2xl font-body text-lg leading-relaxed text-text-dimmed">
          Vielleicht hat sich die Adresse geändert. Hier findest du die wichtigsten Seiten:
        </p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {destinations.map((d) => (
            <li key={d.href}>
              <Link
                href={d.href}
                className="block h-full rounded-xl border border-black/5 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="font-display text-lg text-text-primary">{d.label}</span>
                <span className="mt-1 block font-body text-sm text-text-dimmed">{d.desc}</span>
              </Link>
            </li>
          ))}
        </ul>

        {latest.length > 0 && (
          <>
            <h2 className="mt-14 font-display text-xl text-text-primary">Neu im Blog</h2>
            <ul className="mt-4 space-y-2">
              {latest.map((p) => (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}`} className="font-body text-brand hover:underline">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </main>
  )
}
