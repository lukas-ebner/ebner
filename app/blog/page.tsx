import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog – Lukas Ebner',
  description: 'Artikel und Gedanken – demnächst.',
}

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-section-desktop">
      <h1 className="font-display text-h1 font-normal text-text-primary">Blog</h1>
      <p className="mt-4 font-body text-body text-text-muted">
        Die Blog-Übersicht folgt. Hier entstehen später Artikel zu KI, Führung und Skalierung.
      </p>
      <p className="mt-8">
        <Link href="/" className="font-display font-semibold text-brand hover:underline">
          Zur Startseite
        </Link>
      </p>
    </div>
  )
}
