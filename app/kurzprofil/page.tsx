import type { Metadata } from 'next'
import Image, { getImageProps } from 'next/image'
import Link from 'next/link'
import { NoSnap } from '@/components/NoSnap'

/**
 * Kurzprofil – kompakte, mobil optimierte Profilseite.
 * Ziel: QR-Code auf Vortragsfolien („Über mich“). In 1–2 Minuten auf dem Handy
 * durchscrollbar. Bewusst nicht in der Navigation verlinkt.
 * Fakten ausschließlich aus content/pages/ueber-mich.yaml und projekte.yaml.
 */

export const metadata: Metadata = {
  title: 'Kurzprofil – Lukas Ebner',
  description:
    'Serial Founder aus Regensburg. Schwerpunkt Consulting-to-Product: mit zahlendem Erstkunden und Projektgeschäft ein Produkt entwickeln. Lebenslauf, Gründungen, Fortbildungen.',
  alternates: { canonical: 'https://lukasebner.de/kurzprofil' },
  openGraph: {
    type: 'profile',
    url: 'https://lukasebner.de/kurzprofil',
    title: 'Kurzprofil – Lukas Ebner',
    description: 'Serial Founder. Schwerpunkt Consulting-to-Product.',
    images: [{ url: '/images/slides/lukas-hero_landscape.jpg' }],
  },
}

const timeline = [
  {
    period: '2026 – heute',
    role: 'Co-Founder & CTO, Fracto',
    line: 'Ich baue die Plattform, die Produktdokumentation in fertige Schulungen verwandelt.',
  },
  {
    period: '2023 – heute',
    role: 'Gründer & Geschäftsführer, Leadtime',
    line: 'Aus unserem internen Tool CONNEX wurde ein eigenständiges SaaS. Bootstrapped und profitabel.',
  },
  {
    period: '2023 – heute',
    role: 'Geschäftsführer, Wachstumscoach GmbH',
    line: 'Ich berate Geschäftsführer bei Skalierung, Prozessen und Exit-Vorbereitung.',
  },
  {
    period: '2012 – 2014',
    role: 'MBA, TH Deggendorf',
    line: 'Neben der Geschäftsführung. In einer Seminararbeit entstand die Idee für CONNEX.',
  },
  {
    period: '2009 – 2022',
    role: 'Gründer & Geschäftsführer, eins+null',
    line: 'Im Wohnzimmer gegründet, auf 50 Mitarbeiter skaliert, 2022 verkauft.',
  },
  {
    period: '2005 – 2009',
    role: 'Freiberuflich, u. a. für Goldgas',
    line: 'Aus einer Website wurde eine Vertriebsplattform – der Grundstein für eins+null.',
  },
  {
    period: '2005 – 2010',
    role: 'Studium, Hochschule Ansbach',
    line: 'Multimedia & Kommunikation mit Schwerpunkt IT. Ab Tag eins als Freelancer.',
  },
  {
    period: '2002 – 2005',
    role: 'Selbstständig',
    line: 'Webentwicklung, Printdesign, Logos für Agenturen und Verlage.',
  },
  {
    period: '1999 – 2002',
    role: 'Ausbildung zum Mediengestalter',
    line: 'Creativ Concept Werbeagentur, Regensburg. Grafik, Typografie, Print.',
  },
  {
    period: '1998 – 1999',
    role: 'Grundwehrdienst',
    line: 'Bundeswehr, Bad Reichenhall.',
  },
]

const companies = [
  {
    name: 'Fracto',
    year: 'seit 2026',
    role: 'Co-Founder & CTO',
    what: 'KI-gestützte Schulungsplattform für die MedTech-Industrie – inklusive AI Voice Bot, der am Gerät per QR-Code Fragen beantwortet.',
    url: 'https://fracto.de',
  },
  {
    name: 'Leadtime',
    year: 'seit 2023',
    role: 'Gründer & CEO',
    what: 'Projektmanagement, Zeiterfassung, Abrechnung und CRM in einem System – für IT-Dienstleister und Agenturen.',
    url: 'https://leadtime.app',
  },
  {
    name: 'Wachstumscoach GmbH',
    year: 'seit 2023',
    role: 'Geschäftsführer',
    what: 'Meine Beratung für Geschäftsführer: Operations, Systeme und KI.',
    url: 'https://lukasebner.de',
  },
  {
    name: 'Kraftwerk',
    year: 'seit 2022',
    role: 'Gesellschafter & Beirat',
    what: 'Plattform für die Versorgungswirtschaft, die sechs Technologieunternehmen vereint – darunter eins+null.',
    url: 'https://kraftwerk.io',
  },
  {
    name: 'eins+null',
    year: '2009 – 2022',
    role: 'Gründer & Geschäftsführer',
    what: 'Vertriebsplattform JOULES für Stadtwerke und Energieversorger. 2022 an die Kraftwerk Holding verkauft.',
    url: 'https://einsundnull.de',
  },
]

const education = [
  { year: '2025', title: 'Silicon Valley Entrepreneurship Program', org: 'TH Deggendorf' },
  { year: '2025', title: 'Organisationsberater & Change Manager', org: 'ICO Institut für Coaching & Organisationsberatung' },
  { year: '2025', title: 'Systemisches Coaching kompakt', org: 'ICO Institut für Coaching & Organisationsberatung' },
  { year: '2017', title: 'Human Skills & Leadership', org: 'TH Deggendorf' },
  { year: '2016', title: 'IT-Sicherheitsbeauftragter ISO 27001', org: 'TÜV NORD GROUP' },
  { year: '2014', title: 'MBA Unternehmensgründung und -führung', org: 'TH Deggendorf · Note 1,3' },
  { year: '2010', title: 'Multimedia & Kommunikation', org: 'Hochschule Ansbach · Note 1,7' },
]

const privatePhotos = [
  { src: '/images/privat/L1001208.jpg', alt: 'Steinerne Brücke in Regensburg' },
  { src: '/images/privat/DSCF0404.jpg', alt: 'Spaziergang im Abendlicht' },
  { src: '/images/privat/DSCF1207.jpg', alt: 'Terrasse am Meer' },
]

function SectionHead({ label, title }: { label: string; title: string }) {
  return (
    <header className="mb-8 md:mb-10">
      <div className="mb-5 h-[2px] w-16 bg-brand" aria-hidden />
      <p className="font-mono text-[13px] uppercase tracking-[0.12em] text-text-muted">{label}</p>
      <h2 className="mt-2 font-display text-[32px] leading-[1.15] text-text-primary md:text-[40px]">
        {title}
      </h2>
    </header>
  )
}

export default function KurzprofilPage() {
  const common = { alt: 'Lukas Ebner', sizes: '100vw', priority: true }
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: '/images/slides/lukas-hero_landscape.jpg', width: 2718, height: 1528 })
  const {
    props: { srcSet: mobileSrcSet, ...mobileRest },
  } = getImageProps({ ...common, src: '/images/slides/lukas-hero.jpg', width: 1593, height: 2048 })

  return (
    <main className="overflow-x-hidden font-body text-[18px] leading-[1.6] text-text-primary">
      <NoSnap />

      {/* ── 1. HERO ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-surface-dark text-text-light">
        <div className="relative h-[52vh] max-h-[460px] min-h-[340px] w-full lg:absolute lg:inset-0 lg:h-full lg:max-h-none">
          <picture>
            <source media="(min-width: 1024px)" srcSet={desktopSrcSet} />
            <source media="(max-width: 1023px)" srcSet={mobileSrcSet} />
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <img
              {...mobileRest}
              className="absolute inset-0 h-full w-full object-cover object-[50%_18%] lg:object-[center_20%]"
            />
          </picture>
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-dark via-surface-dark/10 to-surface-dark/40 lg:bg-gradient-to-r lg:from-surface-dark/95 lg:via-surface-dark/50 lg:to-transparent"
            aria-hidden
          />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-16 lg:flex lg:min-h-[760px] lg:items-center lg:px-12 lg:pb-24 lg:pt-32">
          <div className="-mt-16 max-w-xl lg:mt-0">
            <p className="font-mono text-[13px] uppercase tracking-[0.12em] text-brand">
              Lukas Ebner · Serial Founder
            </p>
            <h1 className="mt-4 font-display text-[40px] leading-[1.08] tracking-[-0.02em] md:text-[56px]">
              Ich baue aus Projektgeschäft Produkte.
            </h1>
            <p className="mt-5 text-[19px] leading-[1.55] text-text-light/85 md:text-[21px]">
              Mein Schwerpunkt ist Consulting-to-Product: Mit einem zahlenden Erstkunden und
              Projektgeschäft ein eigenes Produkt entwickeln.
            </p>
            <div className="mt-8 border-t border-white/15 pt-6">
              <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-text-light/50">
                Kurzprofil
              </p>
              <p className="mt-3 text-[18px] leading-[1.6] text-text-light/80">
                2009 habe ich eins+null aus einem Kundenauftrag heraus gegründet, auf 50 Mitarbeiter
                gebracht und 2022 verkauft. Aus unserem internen Tool wurde Leadtime, heute baue ich
                als CTO außerdem Fracto. Als Berater arbeite ich mit Geschäftsführern an Prozessen,
                Systemen und KI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. LEBENSLAUF ───────────────────────────── */}
      <section className="bg-white px-6 py-16 md:py-24">
        <div className="mx-auto max-w-2xl">
          <SectionHead label="Lebenslauf" title="Mein Weg." />
          <ol className="relative border-l-2 border-border pl-6">
            {timeline.map((t) => (
              <li key={`${t.period}-${t.role}`} className="relative pb-8 last:pb-0">
                <span
                  className="absolute -left-[33px] top-[6px] h-4 w-4 rounded-full border-[3px] border-white bg-brand"
                  aria-hidden
                />
                <p className="font-mono text-[14px] uppercase tracking-[0.08em] text-brand">{t.period}</p>
                <h3 className="mt-1 font-display text-[22px] leading-[1.25]">{t.role}</h3>
                <p className="mt-1 text-[17px] leading-[1.55] text-text-dimmed">{t.line}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 3. BETEILIGUNGEN & GRÜNDUNGEN ───────────── */}
      <section className="bg-surface-light px-6 py-16 md:py-24">
        <div className="mx-auto max-w-2xl">
          <SectionHead label="Beteiligungen & Gründungen" title="Meine Unternehmen." />
          <ul className="space-y-4">
            {companies.map((c) => (
              <li
                key={c.name}
                className="rounded-card bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.06)] md:p-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-display text-[26px] leading-[1.15]">
                    <a href={c.url} className="hover:opacity-80" target="_blank" rel="noopener">
                      {c.name}
                    </a>
                  </h3>
                  <span className="font-mono text-[13px] uppercase tracking-[0.08em] text-text-muted">
                    {c.year}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[13px] uppercase tracking-[0.08em] text-brand">{c.role}</p>
                <p className="mt-3 text-[17px] leading-[1.55] text-text-dimmed">{c.what}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 4. FORTBILDUNGEN ────────────────────────── */}
      <section className="bg-white px-6 py-16 md:py-24">
        <div className="mx-auto max-w-2xl">
          <SectionHead label="Fortbildungen" title="Studium, MBA, Zertifikate." />
          <ul className="divide-y divide-border border-y border-border">
            {education.map((e) => (
              <li key={e.title} className="grid grid-cols-[3.5rem_1fr] gap-3 py-4">
                <span className="pt-[3px] font-mono text-[14px] text-brand">{e.year}</span>
                <div>
                  <p className="text-[18px] leading-[1.4] text-text-primary">{e.title}</p>
                  <p className="mt-0.5 text-[16px] leading-[1.45] text-text-muted">{e.org}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 5. WENN ICH NICHT ARBEITE ───────────────── */}
      <section className="bg-teal-light px-6 py-16 md:py-24">
        <div className="mx-auto max-w-2xl">
          <SectionHead label="Privat" title="Wenn ich nicht arbeite." />
          <div className="space-y-4">
            <p>
              Ich lebe mit meiner Frau Lucretia und meinem Sohn Noah in Regensburg. Lucretia habe ich
              2018 in Cluj-Napoca kennengelernt – bei einem Besuch meines Entwicklerteams.
            </p>
            <p>
              Abseits von Bildschirmen bin ich besessen von Kameras und Fotografie. Sie zwingt mich,
              langsamer zu machen und genauer hinzuschauen.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-2 md:gap-3">
            {privatePhotos.map((p) => (
              <div key={p.src} className="relative aspect-[3/4] overflow-hidden rounded-card bg-white/60">
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(min-width: 768px) 220px, 33vw"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. ZUR HAUPTSEITE ───────────────────────── */}
      <section className="bg-surface-dark px-6 py-16 text-center text-text-light md:py-20">
        <div className="mx-auto max-w-xl">
          <p className="font-display text-[28px] leading-[1.2]">Mehr über meine Arbeit.</p>
          <Link
            href="/"
            className="mt-8 inline-flex w-full max-w-xs items-center justify-center rounded-md bg-brand px-6 py-4 font-display text-[18px] tracking-wide text-white transition-colors hover:bg-brand/90"
          >
            Zur Hauptseite
          </Link>
        </div>
      </section>
    </main>
  )
}
