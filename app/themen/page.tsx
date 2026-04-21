import type { Metadata } from 'next'
import Link from 'next/link'
import { NoSnap } from '@/components/NoSnap'

export const metadata: Metadata = {
  title: 'Themen – Lukas Ebner',
  description:
    'Themenseiten zu BAFA-Förderung, Change Management und operativer Unternehmensberatung in Regensburg und Ostbayern.',
  alternates: { canonical: 'https://lukasebner.de/themen' },
}

type TopicCard = {
  href?: string
  category: 'Förderung' | 'Organisation' | 'Strategie' | 'Region'
  title: string
  description: string
  active?: boolean
}

const topicCards: TopicCard[] = [
  {
    href: '/themen/bafa',
    category: 'Förderung',
    title: 'BAFA-Förderung für Unternehmensberatung',
    description: 'Bis zu 80 % Zuschuss, klar eingeordnet und auf operative Umsetzung ausgerichtet.',
    active: true,
  },
  {
    href: '/themen/change-management-beratung',
    category: 'Organisation',
    title: 'Change Management Beratung',
    description: 'Veränderung im Mittelstand, die unter echtem Tagesdruck stabil bleibt.',
    active: true,
  },
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

const regions = [
  'Regensburg',
  'Amberg',
  'Cham',
  'Straubing',
  'Neumarkt i.d.OPf.',
  'Schwandorf',
  'Weiden i.d.OPf.',
]

const categoryColors: Record<TopicCard['category'], string> = {
  Förderung: '#f54a01',
  Organisation: '#5f3dc4',
  Strategie: '#0f766e',
  Region: '#1d4ed8',
}

export default function ThemenIndexPage() {
  return (
    <div className="min-h-screen bg-surface-light">
      <NoSnap />

      <div className="bg-surface-dark py-24 lg:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <h1 className="font-display text-[2.4rem] font-normal leading-[1.1] text-white md:text-[3.2rem] lg:text-[3.8rem]">
            Themen
          </h1>
          <p className="mt-4 max-w-[700px] font-body text-lg leading-relaxed text-white/60">
            Vertiefende Themenseiten für konkrete Fragen aus Förderung, Organisation, Strategie und regionaler
            Unternehmensentwicklung.
          </p>
        </div>
      </div>

      <div className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-6 py-4">
          {['Alle', 'Förderung', 'Organisation', 'Strategie', 'Region'].map((pill) => (
            <span
              key={pill}
              className="flex-shrink-0 cursor-default rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-text-secondary"
              style={pill !== 'Alle' ? { borderColor: categoryColors[pill as TopicCard['category']] + '30', color: categoryColors[pill as TopicCard['category']] } : undefined}
            >
              {pill}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {topicCards.map((card) => {
            const content = (
              <>
                <div className="relative h-44 w-full" style={{ backgroundColor: card.active ? categoryColors[card.category] + '12' : '#e2e8f0' }}>
                  <span
                    className="absolute left-4 top-4 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white"
                    style={{ backgroundColor: categoryColors[card.category] }}
                  >
                    {card.category}
                  </span>
                  {!card.active && (
                    <span className="absolute right-4 top-4 rounded-full bg-slate-700 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white">
                      Bald
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-display text-[1.15rem] font-normal leading-snug text-text-primary transition-colors group-hover:text-brand">
                    {card.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 flex-1 font-body text-sm leading-relaxed text-text-secondary">
                    {card.description}
                  </p>
                  <div className="mt-4">
                    <span className="font-mono text-xs text-text-muted">{card.active ? 'Verfügbar' : 'In Vorbereitung'}</span>
                  </div>
                </div>
              </>
            )

            if (card.active && card.href) {
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {content}
                </Link>
              )
            }

            return (
              <article
                key={card.title}
                className="group flex flex-col overflow-hidden rounded-xl bg-white/90 shadow-sm"
              >
                {content}
              </article>
            )
          })}
        </div>

        <section className="mt-12 border-t border-black/5 pt-10">
          <h2 className="font-display text-2xl text-text-primary">Regionen im Fokus</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {regions.map((region) => (
              <span
                key={region}
                className="rounded-full border border-black/10 bg-white px-4 py-2 font-mono text-xs uppercase tracking-wide text-text-secondary"
              >
                {region}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
