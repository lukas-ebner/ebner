import type { Metadata } from 'next'
import Link from 'next/link'
import { NoSnap } from '@/components/NoSnap'

export const metadata: Metadata = {
  title: 'Themen – Lukas Ebner',
  description:
    'Themenseiten zu BAFA-Förderung, Change Management und operativer Unternehmensberatung in Regensburg und Ostbayern.',
  alternates: { canonical: 'https://lukasebner.de/themen' },
}

type FeaturedTopic = {
  href: string
  kicker: string
  title: string
  description: string
  cta: string
  gradient: string
}

type ComingSoonTopic = {
  title: string
  category: 'Strategie' | 'Organisation' | 'Region'
  description: string
}

const featuredTopics: FeaturedTopic[] = [
  {
    href: '/themen/bafa',
    kicker: 'Förderung',
    title: 'BAFA-Förderung für Unternehmensberatung',
    description: 'Bis zu 80 % Zuschuss, klar eingeordnet und auf operative Umsetzung ausgerichtet.',
    cta: 'Zum Thema BAFA',
    gradient: 'from-[#4A1E1E] via-[#7A2E1E] to-[#C25A1A]',
  },
  {
    href: '/themen/change-management-beratung',
    kicker: 'Organisation',
    title: 'Change Management Beratung',
    description: 'Veränderung im Mittelstand, die unter echtem Tagesdruck stabil bleibt und wirklich greift.',
    cta: 'Zum Thema Change',
    gradient: 'from-[#1B2240] via-[#2C3F73] to-[#3A5D9C]',
  },
]

const comingSoonTopics: ComingSoonTopic[] = [
  {
    category: 'Strategie',
    title: 'Operations-Beratung im Mittelstand',
    description: 'Bald verfügbar, mit konkreten Umsetzungshebeln für Führung und Prozesse.',
  },
  {
    category: 'Strategie',
    title: 'Prozessoptimierung im Mittelstand',
    description: 'Bald verfügbar, mit Fokus auf Durchlaufzeiten, Klarheit und Ergebnisqualität.',
  },
  {
    category: 'Region',
    title: 'KMU-Beratung Regensburg',
    description: 'Bald verfügbar, mit lokalem Fokus auf Unternehmen im Regensburger Umland.',
  },
  {
    category: 'Strategie',
    title: 'Digitalisierungs-Beratung Mittelstand',
    description: 'Bald verfügbar, von Tool-Auswahl bis zur sauberen operativen Einführung.',
  },
  {
    category: 'Organisation',
    title: 'Führungskräfteentwicklung im Mittelstand',
    description: 'Bald verfügbar, mit praxistauglichen Führungsroutinen und Verantwortungslogik.',
  },
]

const regions = ['Regensburg', 'Amberg', 'Cham', 'Straubing', 'Neumarkt i.d.OPf.', 'Schwandorf', 'Weiden i.d.OPf.']

export default function ThemenIndexPage() {
  return (
    <main className="min-h-screen bg-white text-[#111323]">
      <NoSnap />

      <section className="relative overflow-hidden bg-surface-dark pt-32 pb-20 lg:pt-40 lg:pb-24">
        <div className="absolute inset-0 opacity-[0.18]" aria-hidden>
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-brand/40 via-[#7A3B2B] to-transparent blur-3xl" />
          <div className="absolute -bottom-60 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-[#2A2F55] via-[#4B2D42] to-transparent blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand">Themen</p>
          <h1 className="mt-5 max-w-[900px] font-display text-[2.4rem] leading-[1.05] text-white md:text-[3.1rem] lg:text-[3.8rem]">
            Themen für Wachstum, Führung und Umsetzung im Mittelstand
          </h1>
          <p className="mt-6 max-w-[680px] font-body text-lg leading-relaxed text-white/75">
            Keine Artikel-Liste, sondern kuratierte Einstiege für konkrete Herausforderungen —
            von Förderlogik bis Veränderungsumsetzung.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/themen/bafa" className="rounded-full bg-brand px-6 py-3 font-mono text-xs uppercase tracking-wide text-white transition-opacity hover:opacity-90">
              BAFA-Förderung ansehen
            </Link>
            <Link href="/erstgespraech" className="rounded-full border border-white/30 px-6 py-3 font-mono text-xs uppercase tracking-wide text-white/90 transition-colors hover:border-white/60">
              Erstgespräch
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand">Verfügbar</p>
            <h2 className="mt-3 font-display text-3xl text-[#111830] lg:text-4xl">Aktuelle Themen</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {featuredTopics.map((topic) => (
              <article key={topic.href} className="overflow-hidden rounded-2xl border border-[#E2E7EF] bg-white shadow-[0_12px_30px_rgba(16,19,35,0.08)]">
                <div className={`h-44 bg-gradient-to-br ${topic.gradient}`} />
                <div className="p-7 lg:p-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-brand">{topic.kicker}</p>
                  <h3 className="mt-3 font-display text-[1.7rem] leading-tight text-[#111830]">{topic.title}</h3>
                  <p className="mt-4 text-base leading-relaxed text-[#324056]">{topic.description}</p>
                  <Link href={topic.href} className="mt-6 inline-block rounded-full bg-[#111833] px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-white hover:bg-[#0B1024]">
                    {topic.cta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F4F6FA] py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#6B7486]">In Vorbereitung</p>
            <h2 className="mt-3 font-display text-3xl text-[#111830] lg:text-4xl">Nächste Themen</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {comingSoonTopics.map((topic) => (
              <article key={topic.title} className="rounded-2xl border border-[#D8DFE8] bg-white/80 p-5 opacity-90">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#6A7384]">{topic.category}</p>
                <h3 className="mt-3 font-display text-[1.25rem] leading-snug text-[#1A2239]">{topic.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#4A566C]">{topic.description}</p>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-[#7C8697]">Bald verfügbar</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mb-6">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand">Regionale Einstiege</p>
            <h2 className="mt-3 font-display text-3xl text-[#111830] lg:text-4xl">Regensburg und Umland</h2>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[#334056]">
              Diese regionalen Seiten bauen wir als konkrete Einstiegspunkte für Unternehmen in der Oberpfalz und angrenzenden Regionen aus.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {regions.map((region) => (
              <span
                key={region}
                className="rounded-full border border-[#D5DDE8] bg-[#F8FAFC] px-4 py-2 font-mono text-xs uppercase tracking-wide text-[#3A475F]"
              >
                {region}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
