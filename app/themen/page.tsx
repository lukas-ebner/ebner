import type { Metadata } from 'next'
import Link from 'next/link'
import { NoSnap } from '@/components/NoSnap'

export const metadata: Metadata = {
  title: 'Themen Unternehmensberatung – Lukas Ebner',
  description:
    'Sortierte Übersicht der Unternehmensberatung-Themen, an denen mittelständische Unternehmen beim Wachsen zuerst unsauber werden: Förderung, Veränderung, Prozesse, Digitalisierung, Führung, Exit.',
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
  category: string
  description: string
}

const featuredTopics: FeaturedTopic[] = [
  {
    kicker: 'BAFA-Förderung',
    title: 'BAFA-Förderung für Unternehmensberatung, ohne Antragschaos und ohne falsche Erwartungen',
    description:
      'Wenn Beratung sinnvoll wäre, aber die Frage nach Förderfähigkeit sofort alles bremst, ist diese Seite der richtige Einstieg. Du bekommst eine klare Einordnung zu Voraussetzungen, Ablauf, Grenzen und der Frage, wann BAFA-Förderung für dein Unternehmen wirklich hilft und wann sie nur wie eine gute Idee klingt.',
    cta: 'Zur BAFA-Seite',
    href: '/themen/bafa',
    gradient: 'from-[#F44900] via-[#FE7A2F] to-[#FFD7BF]',
  },
  {
    kicker: 'Change Management',
    title: 'Change-Management-Beratung, wenn Veränderung beschlossen ist, aber im Alltag noch nicht trägt',
    description:
      'Neue Struktur, neue Verantwortlichkeiten, neue Tools oder neue Richtung: Veränderung scheitert selten an der Entscheidung, sondern an der Übersetzung in den Betrieb. Diese Seite ist der Einstieg für Unternehmen, die Veränderung nicht nur ankündigen, sondern sauber in Führung, Kommunikation und Alltag verankern wollen.',
    cta: 'Zur Change-Seite',
    href: '/themen/change-management-beratung',
    gradient: 'from-[#111833] via-[#324C7A] to-[#97A8C5]',
  },
]

const comingSoonTopics: ComingSoonTopic[] = [
  {
    category: 'Führung',
    title: 'Skalierbare Führung für wachsende Teams',
    description:
      'Wenn mit jedem neuen Mitarbeiter auch neue Rückfragen entstehen und Entscheidungen wieder nach oben rutschen, fehlt meist keine Motivation, sondern Führungsarchitektur. Dieses Thema sortiert, wie Verantwortung sauber verteilt wird, bevor Wachstum zur Dauerlast wird.',
  },
  {
    category: 'Digitalisierung & KI',
    title: 'KI im Betrieb sinnvoll einsetzen',
    description:
      'Nicht jede Aufgabe braucht einen KI-Case. Aber manche Prozesse verlieren Woche für Woche Zeit, weil Teams zu viel von Hand erledigen. Dieses Thema zeigt, wo KI echten Hebel hat, wo sie nur mehr Komplexität baut und wie man mit kleinen sinnvollen Pilotfeldern beginnt.',
  },
  {
    category: 'Exit & Unternehmenswert',
    title: 'Unternehmen exit-ready machen',
    description:
      'Exit-Reife entsteht nicht beim Verkauf, sondern Jahre davor. Sie steckt in Führung, Prozessen, Transparenz und einem Betrieb, der nicht dauerhaft an einer Person hängt. Dieses Thema ist für Unternehmer gedacht, die ihren Unternehmenswert nicht irgendwann dokumentieren, sondern vorher systematisch aufbauen wollen.',
  },
]

const regions = [
  { label: 'Unternehmensberatung Regensburg', href: '/unternehmensberatung-regensburg' },
  { label: 'Unternehmensberatung Niederbayern', href: '/unternehmensberatung-niederbayern' },
  { label: 'Unternehmensberatung Ostbayern', href: '/unternehmensberatung-ostbayern' },
  { label: 'KI-Beratung Regensburg', href: '/ki-beratung-regensburg' },
  { label: 'Digitalisierungsberatung Regensburg', href: '/digitalisierungsberatung-regensburg' },
  { label: 'Prozessoptimierung Regensburg', href: '/prozessoptimierung-regensburg' },
  { label: 'Operations-Beratung Agenturen', href: '/operations-beratung-agenturen' },
]

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
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand">Unternehmensberatung Themen</p>
          <h1 className="mt-5 max-w-[900px] font-display text-[2.4rem] leading-[1.05] text-white md:text-[3.1rem] lg:text-[3.8rem]">
            Unternehmensberatung Themen im Überblick, für Geschäftsführer, die nicht mehr alles gleichzeitig lösen wollen
          </h1>
          <p className="mt-6 max-w-[860px] font-body text-lg leading-relaxed text-white/75">
            Diese Seite ist kein Produktkatalog. Sie ist die sortierte Übersicht über die Themen, an denen mittelständische Unternehmen beim Wachsen zuerst unsauber werden: Förderung, Veränderung, Prozesse, Digitalisierung, Führung und Exit-Reife. Genau deshalb findest du hier keine leeren Beratungs-Schlagworte, sondern konkrete Einstiege für echte Baustellen. Die Klammer dahinter ist Lukas’ eigene Unternehmergeschichte: vier Gründungen, 25 Jahre Aufbauarbeit, 13 Jahre eins+null, 50 Mitarbeitende, 1000+ Projekte und ein Exit 2022. Das sind nicht einfach Themen der Unternehmensberatung. Das sind Themen, die im echten Betrieb zuerst teuer werden.
          </p>
          <p className="mt-5 max-w-[860px] font-body text-base leading-relaxed text-white/70">
            Gerade jetzt ist diese Sortierung wichtiger als früher. Creditreform meldete im Frühjahr 2026 zwar einen Geschäftsklimaindex von 5,3 Punkten und damit den höchsten Stand seit vier Jahren. Gleichzeitig blieb die Lage fragil. Und die vbw verwies am 22. April 2026 auf nur noch 0,5 Prozent Wachstumsprognose für dieses Jahr. Heißt übersetzt: Wer Wachstum will, kann nicht darauf warten, dass der Markt interne Reibung überdeckt. Er muss wissen, mit welchem Thema er anfangen sollte.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/themen/bafa" className="rounded-full bg-brand px-6 py-3 font-mono text-xs uppercase tracking-wide text-white transition-opacity hover:opacity-90">
              BAFA-Förderung ansehen
            </Link>
            <Link href="/erstgespraech" className="rounded-full border border-white/30 px-6 py-3 font-mono text-xs uppercase tracking-wide text-white/90 transition-colors hover:border-white/60">
              Erstgespräch buchen
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand">Aktuelle Schwerpunkte</p>
            <h2 className="mt-3 font-display text-3xl text-[#111830] lg:text-4xl">Mit diesen Themen beginnen Unternehmen meistens zuerst</h2>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[#334056]">
              Nicht jedes Problem braucht sofort eine große Strategie. Oft reicht die richtige Reihenfolge. Diese beiden Seiten sind deshalb zuerst sichtbar, weil sie in vielen mittelständischen Unternehmen den Einstieg markieren: Förderung sauber nutzen und Veränderung so umsetzen, dass sie im Alltag nicht stecken bleibt.
            </p>
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

      <section className="bg-[#F7F8FB] py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mb-8 max-w-4xl">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#6B7486]">Warum genau diese Themen</p>
            <h2 className="mt-3 font-display text-3xl text-[#111830] lg:text-4xl">
              Weil Unternehmensberatung erst dann nützlich wird, wenn sie echte Baustellen sortiert
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[#334056]">
              Viele Beratungsseiten wirken wie Menükarten. Strategie, Prozesse, Change, Digitalisierung, Organisation. Alles klingt wichtig. Alles klingt irgendwie richtig. Und am Ende bleibt doch offen, womit ein Geschäftsführer anfangen soll, wenn gerade fünf Dinge gleichzeitig drücken. Genau deshalb ist diese Themen-Seite anders gebaut. Sie sortiert keine Beratungsbegriffe. Sie sortiert typische Engpässe im Mittelstand.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-[#334056]">
              Die Auswahl ist nicht theoretisch. Lukas hat diese Themen über Jahre selbst erlebt: im Aufbau von eins+null, in 1000+ Projekten, in der Führung eines wachsenden Teams, in Tool- und Prozessentscheidungen, in Veränderungsphasen und schließlich in der Übergabe des eigenen Unternehmens. Heute übersetzt Wachstumscoach genau diese Erfahrung in Beratung. Deshalb hängen BAFA, Change, Prozesse, Digitalisierung, Führung und Exit hier nicht zufällig nebeneinander. Sie bilden den Weg ab, an dem Unternehmen intern robuster werden.
            </p>
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
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand">Lokale und fachliche Einstiege</p>
            <h2 className="mt-3 font-display text-3xl text-[#111830] lg:text-4xl">Regensburg, Niederbayern, Ostbayern und einzelne Schwerpunkte</h2>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[#334056]">
              Diese Einstiege sind bewusst lokal verankert. Lukas hat seine gesamte unternehmerische Laufbahn in Ostbayern aufgebaut: vom ersten Freelance-Auftrag über eins+null bis zum Exit 2022 an die Kraftwerk Holding. Für mittelständische Unternehmen in Regensburg, Niederbayern und Ostbayern heißt das: Beratung von jemandem, der die regionale Wirtschaft nicht aus der Vogelperspektive kennt, sondern aus 25 Jahren Alltag.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {regions.map((region) => (
              <Link
                key={region.href}
                href={region.href}
                className="rounded-full border border-[#D5DDE8] bg-[#F8FAFC] px-4 py-2 font-mono text-xs uppercase tracking-wide text-[#3A475F] transition-colors hover:border-[#1B2235] hover:bg-white"
              >
                {region.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="rounded-2xl border border-[#E0E6ED] bg-[#F6F7FA] p-8 lg:p-12">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand">
              Wenn du noch nicht sicher bist, welches Thema zuerst dran ist
            </p>
            <h2 className="mt-3 font-display text-[2rem] leading-tight text-[#111830] lg:text-[2.75rem]">
              Dann brauchst du wahrscheinlich nicht mehr Input, sondern bessere Sortierung
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[#334056]">
              Genau dafür ist das Erstgespräch da. Nicht für eine Verkaufsshow. Sondern für die ehrliche Einordnung, welches Thema in deinem Unternehmen gerade wirklich zuerst gelöst werden sollte. Manche kommen über BAFA. Manche über Change. Manche merken erst im Gespräch, dass eigentlich Führung, Prozesse oder Digitalisierung der Engpass sind.
            </p>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#4A566C]">
              Wenn du ein Unternehmen führst, das wächst, mehr Verantwortung verteilt und trotzdem nicht leichter läuft, dann ist diese Themen-Seite der Überblick. Das Gespräch ist der nächste Schritt.
            </p>
            <div className="mt-8">
              <Link
                href="/erstgespraech"
                className="rounded-full bg-brand px-6 py-3 font-mono text-xs uppercase tracking-wide text-white transition-opacity hover:opacity-90"
              >
                Erstgespräch buchen
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
