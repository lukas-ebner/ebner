import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Themen – Lukas Ebner',
  description:
    'Themenseiten zu BAFA-Förderung, Change Management und operativer Unternehmensberatung in Regensburg und Ostbayern.',
  alternates: { canonical: 'https://lukasebner.de/themen' },
}

const topicTiles = [
  {
    href: '/themen/bafa',
    tag: 'Förderung',
    title: 'BAFA-Förderung für Unternehmensberatung',
    description: 'Bis zu 80 % Zuschuss, sauber eingeordnet und operativ nutzbar gemacht.',
    active: true,
  },
  {
    href: '/themen/change-management-beratung',
    tag: 'Organisation',
    title: 'Change Management Beratung',
    description: 'Veränderung im Mittelstand, die auch unter Alltagsdruck tragfähig bleibt.',
    active: true,
  },
  {
    href: '#',
    tag: 'Bald',
    title: 'KI-Readiness in der Umsetzung',
    description: 'Wird als vertiefende Themenseite ergänzt.',
    active: false,
  },
  {
    href: '#',
    tag: 'Bald',
    title: 'Operations für Agenturen',
    description: 'Wird als vertiefende Themenseite ergänzt.',
    active: false,
  },
]

const regionTiles = [
  'Regensburg',
  'Oberpfalz',
  'Ostbayern',
  'Niederbayern',
  'München',
  'Nürnberg',
  'Augsburg',
  'Passau',
  'Remote (DACH)',
]

export default function ThemenIndexPage() {
  return (
    <main className="bg-[#F5F7FA] pt-28 text-[#0F1328]">
      <div className="mx-auto w-full max-w-6xl px-6 pb-24 lg:px-8">
        <section className="rounded-2xl border border-[#DEE4EC] bg-white p-8 lg:p-12">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand">Themen</p>
          <h1 className="mt-4 font-display text-4xl leading-tight lg:text-5xl">
            Inhalte mit fachlicher Tiefe, gebaut für operative Entscheidungen.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[#324157]">
            Hier findest du fokussierte Themenseiten als Einstieg für konkrete Fragestellungen. Reduzierter Aufbau,
            klare Struktur, kein Marketing-Overload.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-3xl">Nach Thema</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {topicTiles.map((tile) =>
              tile.active ? (
                <Link key={tile.title} href={tile.href} className="group rounded-2xl border border-[#DEE4EC] bg-white p-6 hover:border-brand">
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand">{tile.tag}</p>
                  <h3 className="mt-3 font-display text-2xl">{tile.title}</h3>
                  <p className="mt-2 text-[#3A465C]">{tile.description}</p>
                  <p className="mt-4 font-mono text-xs uppercase tracking-wide text-brand">Zur Themenseite →</p>
                </Link>
              ) : (
                <article key={tile.title} className="rounded-2xl border border-dashed border-[#D6DDE7] bg-[#F8FAFC] p-6 opacity-70">
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#66748A]">{tile.tag}</p>
                  <h3 className="mt-3 font-display text-2xl text-[#2D3648]">{tile.title}</h3>
                  <p className="mt-2 text-[#556176]">{tile.description}</p>
                </article>
              )
            )}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-3xl">Nach Region</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {regionTiles.map((region) => (
              <div key={region} className="rounded-xl border border-[#DEE4EC] bg-white px-4 py-3 font-mono text-xs uppercase tracking-wide text-[#334056]">
                {region}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
