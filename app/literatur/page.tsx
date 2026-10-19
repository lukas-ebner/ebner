import type { Metadata } from 'next'
import { ArrowUpRight, Linkedin } from 'lucide-react'
import { NoSnap } from '@/components/NoSnap'

/**
 * Literaturliste zur AHEAD-Keynote „Holt den Kunden mit ins Boot!“ (Fraunhofer AHEAD, 21.10.2026).
 * Ziel: QR-Code auf der letzten Folie. Mobil optimiert, bewusst nicht in der Navigation verlinkt.
 * Reihenfolge = Reihenfolge im Vortrag.
 */

export const metadata: Metadata = {
  title: 'Literaturliste – Lukas Ebner',
  description:
    'Die Bücher aus der Keynote „Holt den Kunden mit ins Boot!“: Productization, Customer Development, B2B-Märkte, Kundeninterviews und Produktdenken.',
  alternates: { canonical: 'https://lukasebner.de/literatur' },
  openGraph: {
    type: 'website',
    url: 'https://lukasebner.de/literatur',
    title: 'Literaturliste – Lukas Ebner',
    description: 'Die Bücher aus der Keynote „Holt den Kunden mit ins Boot!“.',
  },
}

type Book = {
  topic: string
  title: string
  authors: string
  year: string
  cover: string
  about: string
  why: string
  amazon: string
}

const amazon = (q: string) => `https://www.amazon.de/s?k=${encodeURIComponent(q)}`

const books: Book[] = [
  {
    topic: 'Die Methode',
    title: 'Productize',
    authors: 'Eisha Tierney Armstrong',
    year: '2016',
    cover: '/images/literatur/productize.png',
    about:
      'Wie aus Beratungs- und Dienstleistungsgeschäft Schritt für Schritt skalierbare Produkte werden – kompakt, anschaulich und mit vielen Beispielen.',
    why: 'Das Buch zur Methode aus dem Vortrag: Ihr startet als Spezialdienstleister in eurer Zielbranche und macht aus Projekten ein Produkt.',
    amazon: amazon('Productize Eisha Tierney Armstrong'),
  },
  {
    topic: 'Team · Lernkreislauf',
    title: 'Escaping the Build Trap',
    authors: 'Melissa Perri',
    year: '2018',
    cover: '/images/literatur/buildtrap.png',
    about:
      'Warum Teams in der „Build Trap“ landen – sie liefern Features statt Ergebnisse – und wie gutes Produktmanagement am Kundenproblem ansetzt.',
    why: 'Hilft euch, den Build-Measure-Learn-Kreislauf in Gang zu halten, statt nur an der Technologie weiterzubauen.',
    amazon: amazon('Escaping the Build Trap Melissa Perri'),
  },
  {
    topic: 'Team · Zwei Rollen',
    title: 'The Entrepreneur’s Guide to Customer Development',
    authors: 'Brant Cooper & Patrick Vlaskovits',
    year: '2010',
    cover: '/images/literatur/custdev.png',
    about:
      'Steve Blanks Customer Development auf den Punkt gebracht: erst Kunde und Geschäftsmodell testen und validieren – inklusive Pivots. Dann skalieren.',
    why: 'Die kürzeste Einführung in die Arbeit der Rolle, die rausgeht und mit Kunden spricht.',
    amazon: amazon('Entrepreneur’s Guide to Customer Development Cooper Vlaskovits'),
  },
  {
    topic: 'Markt · B2B',
    title: 'Lean Analytics',
    authors: 'Alistair Croll & Benjamin Yoskovitz',
    year: '2013',
    cover: '/images/literatur/leananalytics3d.png',
    about:
      'Welche Kennzahlen in welcher Phase eines Startups zählen – mit einem eigenen Teil zu Unternehmenskunden und den Besonderheiten von B2B.',
    why: '„Consumers love novelty. Businesses just call it risk.“ – warum B2B-Kunden anders kaufen und wie ihr das messt.',
    amazon: amazon('Lean Analytics Croll Yoskovitz'),
  },
  {
    topic: 'Markt · Marktlücken',
    title: 'Lean B2B',
    authors: 'Étienne Garbugli',
    year: '2014',
    cover: '/images/literatur/leanb2b3d.png',
    about:
      'Customer Development speziell für Geschäftskunden: Zielmarkt wählen, Zugang zu Entscheidern finden, Probleme validieren, erste Kunden gewinnen.',
    why: '„Problems worth solving are typically invisible from the outside.“ – genau die Lücken, die ihr nur im Projekt mit dem Kunden findet.',
    amazon: amazon('Lean B2B Garbugli'),
  },
  {
    topic: 'Markt · Kundengespräche',
    title: 'The Mom Test',
    authors: 'Rob Fitzpatrick',
    year: '2013',
    cover: '/images/literatur/momtest3d.png',
    about:
      'Wie man Kundengespräche führt, aus denen man wirklich etwas lernt: über das Leben des Kunden reden, nach konkreter Vergangenheit fragen, Komplimente ignorieren.',
    why: 'Ein Nachmittag Lektüre – und eure nächsten zehn Kundengespräche liefern Fakten statt höflicher Zustimmung.',
    amazon: amazon('The Mom Test Rob Fitzpatrick'),
  },
  {
    topic: 'Produkt · Service',
    title: 'Made to Serve',
    authors: 'Tim Baines & Howard Lightfoot',
    year: '2013',
    cover: '/images/literatur/madetoserve3d.png',
    about:
      'Servitization: wie Hersteller nicht mehr nur Maschinen verkaufen, sondern Produkt und Service zusammen – als Nutzen im Einsatz.',
    why: 'Die Industrie geht gerade den umgekehrten Weg. Ihr habt den Service-Anteil am Anfang ohnehin – nutzt ihn.',
    amazon: amazon('Made to Serve Baines Lightfoot'),
  },
]

const LINKEDIN_URL = 'https://www.linkedin.com/in/lukas-ebner/'

export default function LiteraturPage() {
  return (
    <main className="overflow-x-hidden font-body text-[18px] leading-[1.6] text-text-primary">
      <NoSnap />

      {/* ── HERO ───────────────────────────────────── */}
      <section className="bg-surface-dark px-6 pb-14 pt-28 text-text-light md:pb-20 md:pt-36">
        <div className="mx-auto max-w-2xl">
          <p className="font-mono text-[13px] uppercase tracking-[0.12em] text-brand">
            Fraunhofer AHEAD · 21.10.2026
          </p>
          <h1 className="mt-4 font-display text-[40px] leading-[1.08] tracking-[-0.02em] md:text-[56px]">
            Literaturliste
          </h1>
          <p className="mt-5 text-[19px] leading-[1.55] text-text-light/85 md:text-[21px]">
            Die Bücher aus meiner Keynote „Holt den Kunden mit ins Boot!“ – in der Reihenfolge, in der
            sie im Vortrag vorkommen.
          </p>
        </div>
      </section>

      {/* ── BÜCHER ─────────────────────────────────── */}
      <section className="bg-surface-light px-6 py-14 md:py-20">
        <ol className="mx-auto max-w-2xl space-y-5">
          {books.map((b) => (
            <li
              key={b.title}
              className="rounded-card bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.06)] md:p-7"
            >
              <div className="flex gap-5 md:gap-7">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.cover}
                  alt={`Cover: ${b.title}`}
                  loading="lazy"
                  className="h-auto w-[92px] shrink-0 self-start drop-shadow-[0_10px_18px_rgba(0,0,0,0.25)] md:w-[120px]"
                />
                <div className="min-w-0">
                  <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-brand">{b.topic}</p>
                  <h2 className="mt-1 font-display text-[23px] leading-[1.2] md:text-[26px]">{b.title}</h2>
                  <p className="mt-1 text-[15px] leading-[1.4] text-text-muted">
                    {b.authors} · {b.year}
                  </p>
                </div>
              </div>
              <p className="mt-5 text-[17px] leading-[1.55] text-text-dimmed">{b.about}</p>
              <p className="mt-3 border-l-2 border-brand pl-4 text-[17px] leading-[1.55] text-text-primary">
                <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-text-muted">
                  Warum jetzt ·{' '}
                </span>
                {b.why}
              </p>
              <a
                href={b.amazon}
                target="_blank"
                rel="noopener"
                className="mt-5 inline-flex items-center gap-2 font-display text-[16px] text-brand hover:opacity-80"
              >
                Bei Amazon ansehen
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </a>
            </li>
          ))}
        </ol>
      </section>

      {/* ── KONTAKT ────────────────────────────────── */}
      <section className="bg-surface-dark px-6 py-16 text-center text-text-light md:py-20">
        <div className="mx-auto max-w-xl">
          <p className="font-display text-[28px] leading-[1.2]">Fragen zu eurem Team, Markt oder Produkt?</p>
          <p className="mt-4 text-[18px] leading-[1.55] text-text-light/80">
            Ich nehme mir gern für jedes Team Zeit für einen Call.
          </p>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener"
            className="mt-8 inline-flex w-full max-w-xs items-center justify-center gap-3 rounded-md bg-brand px-6 py-4 font-display text-[18px] tracking-wide text-white transition-colors hover:bg-brand/90"
          >
            <Linkedin className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            Vernetz dich mit mir
          </a>
          <p className="mt-6">
            <a href="/kurzprofil" className="font-mono text-[13px] uppercase tracking-[0.12em] text-text-light/60 hover:text-text-light">
              Kurzprofil ansehen
            </a>
          </p>
        </div>
      </section>
    </main>
  )
}
