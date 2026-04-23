import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { OptInForm } from './OptInForm'

export const metadata: Metadata = {
  title: '(Un)verzichtbar – Der Unternehmer-Roman von Lukas Ebner | Kostenlos lesen',
  description:
    '90 Tage Mittelstand. Ein Geschäftsführer, der lernt, nicht mehr der Engpass zu sein. Als eBook, PDF und Audiobook kostenlos. Nur E-Mail-Adresse – kein Newsletter-Zwang.',
  alternates: { canonical: 'https://lukasebner.de/unverzichtbar' },
  openGraph: {
    title: '(Un)verzichtbar – Der Unternehmer-Roman',
    description:
      'Wie Dein Business in 90 Tagen endlich ohne Dich läuft. eBook, PDF & Audiobook – kostenlos.',
    url: 'https://lukasebner.de/unverzichtbar',
    images: [{ url: '/images/leadmagnet/buch_transparent.png' }],
  },
}

const bookJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Book',
  name: '(Un)verzichtbar',
  alternateName: 'Wie Dein Business in 90 Tagen endlich ohne Dich läuft',
  author: { '@type': 'Person', name: 'Lukas Ebner' },
  publisher: { '@type': 'Organization', name: 'Leadtime Publishing' },
  bookFormat: ['EBook', 'AudiobookFormat'],
  inLanguage: 'de',
  description:
    'Der Unternehmer-Roman über 90 Tage im Mittelstand. Thomas Maier, Maschinenbau-Mittelstand Ostbayern, 32 Mitarbeiter, baut seinen Betrieb so um, dass er am Ende nicht mehr der Engpass ist.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock',
    url: 'https://lukasebner.de/unverzichtbar',
  },
}

// ──────────────────────────────────────────────────────────────────────────
// COPY PLACEHOLDER — wird durch Emma (CONTENT-OS v3.4) ersetzt
// Strukturell bereits final, Sprache noch Draft.
// ──────────────────────────────────────────────────────────────────────────

export default function UnverzichtbarPage() {
  return (
    <main className="bg-white text-[#101323]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookJsonLd) }}
      />

      {/* ── HERO ────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-surface-dark pt-28 lg:pt-32">
        {/* Background image right half */}
        <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block">
          <div className="relative h-full w-full">
            <Image
              src="/images/leadmagnet/buch_transparent.png"
              alt="(Un)verzichtbar – Buchmockup"
              fill
              priority
              className="object-contain object-center"
              sizes="50vw"
            />
          </div>
        </div>

        <div className="relative mx-auto grid min-h-[640px] max-w-6xl grid-cols-1 items-center gap-10 px-6 pb-16 lg:grid-cols-2 lg:px-8 lg:pb-24 lg:pt-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand">
              Der Unternehmer-Roman · Leadtime Publishing
            </p>
            <h1 className="mt-5 font-display text-4xl leading-[1.05] text-white lg:text-[3.25rem]">
              Wenn dein Business ständig an dir hängt, obwohl du es aufgebaut hast, damit es
              irgendwann nicht mehr an dir hängt.
            </h1>
            <p className="mt-6 max-w-[520px] text-lg leading-relaxed text-white/80">
              In 90 Tagen baut Thomas Maier seinen Maschinenbau-Mittelstand so um, dass er am Ende
              nicht mehr der Engpass ist. Lies die Geschichte, an der du dein eigenes System
              wiedererkennst.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/20 px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-white/85">
                eBook · .epub
              </span>
              <span className="rounded-full border border-white/20 px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-white/85">
                PDF
              </span>
              <span className="rounded-full border border-white/20 px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-white/85">
                Audiobook · 4h 25min
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#zugang"
                className="rounded-full bg-brand px-6 py-3 font-mono text-xs uppercase tracking-wide text-white transition-opacity hover:opacity-90"
              >
                Kostenlos lesen &amp; hören
              </a>
              <a
                href="#worum-es-geht"
                className="rounded-full border border-white/30 px-6 py-3 font-mono text-xs uppercase tracking-wide text-white/90 transition-colors hover:border-white/60"
              >
                Worum es geht
              </a>
            </div>

            <p className="mt-4 text-xs text-white/55">
              Kostenlos · Nur mit E-Mail · Kein Pop-up · Kein Spam
            </p>
          </div>

          {/* Mobile hero image */}
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[320px] lg:hidden">
            <Image
              src="/images/leadmagnet/buch_transparent.png"
              alt="(Un)verzichtbar – Buchmockup"
              fill
              priority
              className="object-contain"
              sizes="(max-width: 1024px) 320px, 0"
            />
          </div>
        </div>
      </section>

      {/* ── FORMATE ────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
        <div className="mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand">Was du bekommst</p>
          <h2 className="mt-3 font-display text-[2rem] leading-tight text-[#111830] lg:text-[2.5rem]">
            Drei Formate. Ein Buch. Kostenlos.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <FormatCard
            label="eBook · .epub"
            title="Für dein Lesegerät"
            body="Tolino, Kindle, Apple Books, Pocketbook. Passt überall, wo du ohnehin liest."
          />
          <FormatCard
            label="PDF"
            title="Für Bildschirm &amp; Druck"
            body="Sauber gesetzt, mit Kapitelmarken. Für alle, die lieber scrollen oder ausdrucken."
          />
          <FormatCard
            label="Audiobook · .m4b"
            title="Für unterwegs"
            body="4 Stunden 25 Minuten. Kapitelmarken drin. Zum Hören im Auto, beim Laufen, am Morgen."
          />
        </div>
      </section>

      {/* ── WORUM ES GEHT ─────────────────────────── */}
      <section id="worum-es-geht" className="border-y border-[#E8EDF3] bg-[#FAFBFC]">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-20 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand">
              Worum es geht
            </p>
            <h2 className="mt-3 font-display text-[2rem] leading-tight text-[#111830] lg:text-[2.5rem]">
              Warum ein Roman und kein Ratgeber
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-[#253043]">
              <p>
                Ratgeber für Unternehmer gibt es genug. Das Problem: Zwischen <em>ich weiß das</em>{' '}
                und <em>ich tue das</em> schiebt sich eine Identitätsfrage, die kein Framework
                beantwortet.
              </p>
              <p>
                Thomas Maier, Geschäftsführer eines 32-Mann-Betriebs in Ostbayern, hat 20 Jahre
                aufgebaut, was jetzt an ihm hängt. Er ist gut. Er ist zuverlässig. Er ist der Grund,
                warum das Geschäft funktioniert — und genau deshalb ist er der Engpass, der es
                bremst.
              </p>
              <p>
                In 90 Tagen macht er das Gegenteil von dem, was ihm jahrzehntelang gut tat. Nicht
                alles gelingt. Nicht alles ist angenehm. Aber am Ende läuft der Laden zum ersten Mal
                ohne seine tägliche Entscheidung.
              </p>
            </div>
            <blockquote className="mt-8 border-l-4 border-brand pl-5 text-xl italic text-[#1F2940]">
              &bdquo;Die Branche ändert die Vokabeln. Das Muster ändert sie nicht.&ldquo;
            </blockquote>
          </div>

          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-[#E8EEF4] shadow-lg">
            <Image
              src="/images/leadmagnet/unverzichtbar-unternehmer.jpg"
              alt="Unternehmer mit Buch in der Hand"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 500px"
            />
          </div>
        </div>
      </section>

      {/* ── WER THOMAS IST ─────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand">Hauptfigur</p>
        <h2 className="mt-3 font-display text-[2rem] leading-tight text-[#111830] lg:text-[2.5rem]">
          Thomas ist nicht du. Aber vermutlich kennst du Thomas.
        </h2>
        <div className="mt-6 space-y-5 text-lg leading-relaxed text-[#253043]">
          <p>
            Thomas Maier führt einen Maschinenbau-Betrieb in Cham. 32 Mitarbeiter, solide Marge, gute
            Auftragslage, seit fünf Jahren auf Auto-Pilot — nur dass dieser Auto-Pilot Thomas selbst
            ist. Er trifft täglich 40 bis 60 kleine Entscheidungen, die niemand sonst im Unternehmen
            mehr trifft.
          </p>
          <p>
            Der Roman folgt ihm über 90 Tage. Er ist fiktiv. Aber die Summe seiner Szenen ist die
            Summe typischer Mandate bei Wachstumscoach GmbH. Wenn du dich wiedererkennst, ist das
            kein Zufall.
          </p>
        </div>
      </section>

      {/* ── KAPITELVORSCHAU ────────────────────────── */}
      <section className="border-y border-[#E8EDF3] bg-[#FAFBFC]">
        <div className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand">Struktur</p>
          <h2 className="mt-3 font-display text-[2rem] leading-tight text-[#111830] lg:text-[2.5rem]">
            90 Tage. 12 Kapitel. Ein Bogen.
          </h2>
          <ul className="mt-10 space-y-5">
            {CHAPTERS.map((ch, idx) => (
              <li key={idx} className="flex gap-6 border-b border-[#E0E6ED] pb-5 last:border-0">
                <span className="shrink-0 font-mono text-xs uppercase tracking-wider text-brand">
                  {ch.day}
                </span>
                <p className="text-lg leading-relaxed text-[#1F2940]">{ch.teaser}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── AUTOR ───────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand">Wer das geschrieben hat</p>
        <h2 className="mt-3 font-display text-[2rem] leading-tight text-[#111830] lg:text-[2.5rem]">
          Lukas Ebner kennt Thomas aus 13 Jahren Geschäftsführung
        </h2>
        <div className="mt-6 space-y-5 text-lg leading-relaxed text-[#253043]">
          <p>
            25 Jahre Unternehmer in Regensburg. Vier Gründungen. Gründer von eins+null (13 Jahre,
            1000+ Projekte, Exit 2022 an Kraftwerk Holding). Heute CEO der Wachstumscoach GmbH, CTO
            von Fracto, Entwickler der SaaS Leadtime.
          </p>
          <p>
            MBA TH Deggendorf (1,3). ICO-zertifiziert. Systemischer Coach. Teilnehmer Silicon Valley
            Program 2025. Arbeitet mit Geschäftsführern aus Mittelstand, Tech, MedTech und Agenturen
            — meist im Ostbayern-Dreieck zwischen Regensburg, Cham und Passau.
          </p>
          <p className="rounded-lg border-l-4 border-brand bg-[#FAFBFC] p-5 text-base italic">
            Thomas ist nicht Lukas. Aber Lukas kennt Thomas aus 13 Jahren Geschäftsführung — und aus
            den Mandaten, die er heute begleitet.
          </p>
        </div>
        <Link
          href="/ueber-mich"
          className="mt-6 inline-block font-mono text-xs uppercase tracking-wide text-brand hover:opacity-80"
        >
          Mehr über Lukas →
        </Link>
      </section>

      {/* ── OPT-IN FORM ────────────────────────────── */}
      <section id="zugang" className="bg-surface-dark py-20 lg:py-28">
        <div className="mx-auto max-w-2xl px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand">Zugang anfordern</p>
            <h2 className="mt-3 font-display text-[2rem] leading-tight text-white lg:text-[2.75rem]">
              Schick mir deine E-Mail. Ich schick dir die drei Formate.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-white/70">
              Doppelte Bestätigung (DSGVO). Danach bekommst du eBook, PDF und Audiobook sofort per
              Mail. Kein Newsletter-Zwang.
            </p>
          </div>
          <OptInForm variant="dark" />
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand">FAQ</p>
        <h2 className="mt-3 font-display text-[2rem] leading-tight text-[#111830] lg:text-[2.5rem]">
          Häufige Fragen
        </h2>
        <div className="mt-10 space-y-8">
          {FAQ.map((item, idx) => (
            <div key={idx} className="border-b border-[#E0E6ED] pb-8 last:border-0">
              <h3 className="font-display text-xl leading-snug text-[#111830]">{item.q}</h3>
              <p className="mt-3 text-lg leading-relaxed text-[#253043]">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── END-CTA ─────────────────────────────────── */}
      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="rounded-2xl border border-[#E0E6ED] bg-[#F6F7FA] p-8 lg:p-12">
            <h2 className="font-display text-[2rem] leading-tight text-[#111830] lg:text-[2.75rem]">
              Wenn du dir lieber gleich unterhältst, statt zu lesen
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#334056]">
              Das Buch ist der ruhige Weg. Das Erstgespräch ist der direkte. Beides führt zum
              selben Punkt — dass dein Betrieb nicht mehr an dir hängt.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/erstgespraech"
                className="rounded-full bg-brand px-6 py-3 font-mono text-xs uppercase tracking-wide text-white transition-opacity hover:opacity-90"
              >
                Erstgespräch buchen
              </Link>
              <Link
                href="/ueber-mich"
                className="rounded-full border border-[#1B2235]/30 px-6 py-3 font-mono text-xs uppercase tracking-wide text-[#1B2235] transition-colors hover:border-[#1B2235]/60"
              >
                Mehr über Lukas
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Data
// ──────────────────────────────────────────────────────────────────────────

function FormatCard({ label, title, body }: { label: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-[#E0E6ED] bg-white p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-brand">{label}</p>
      <h3
        className="mt-3 font-display text-xl leading-tight text-[#111830]"
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <p className="mt-3 text-base leading-relaxed text-[#253043]">{body}</p>
    </div>
  )
}

const CHAPTERS: { day: string; teaser: string }[] = [
  {
    day: 'Tag 1',
    teaser: 'Der Montag, an dem Thomas merkt, dass er sich selbst im Weg steht.',
  },
  {
    day: 'Tag 5',
    teaser: 'Die Excel-Liste, die kein Mitarbeiter freiwillig öffnet — und warum sie trotzdem funktioniert.',
  },
  {
    day: 'Tag 15',
    teaser: 'Die erste Woche ohne Chef-Entscheidung. Chaos oder Befreiung?',
  },
  {
    day: 'Tag 22',
    teaser: 'Der Anruf, bei dem Thomas zum ersten Mal nicht ans Telefon geht.',
  },
  {
    day: 'Tag 30',
    teaser: 'Warum das Team plötzlich wächst, obwohl niemand eingestellt wurde.',
  },
  {
    day: 'Tag 45',
    teaser: 'Der Rückfall. Was passiert, wenn alles wieder bei ihm landet.',
  },
  {
    day: 'Tag 60',
    teaser: 'Das Gespräch mit der Frau — das Gespräch, das zehn Jahre nicht stattgefunden hat.',
  },
  {
    day: 'Tag 75',
    teaser: 'Die Übergabe, die er sich drei Jahre lang nur vorgestellt hat.',
  },
  {
    day: 'Tag 90',
    teaser: 'Der Montag, der endlich anders anfängt.',
  },
]

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Ist das wirklich kostenlos?',
    a: 'Ja. Kein Kleingedrucktes, keine Testphase, keine Kreditkarte. Du bekommst eBook, PDF und Audiobook gegen deine E-Mail-Adresse.',
  },
  {
    q: 'Welche Formate bekomme ich?',
    a: 'Drei Dateien per Mail: .epub für Tolino/Kindle/Apple Books, ein sauber gesetztes PDF und ein .m4b-Audiobook mit Kapitelmarken. Du entscheidest, wo du liest oder hörst.',
  },
  {
    q: 'Wie lange dauert das Audiobook?',
    a: '4 Stunden 25 Minuten. Kapitelweise geschnitten, sodass du jederzeit springen kannst.',
  },
  {
    q: 'Bekomme ich danach Werbung?',
    a: 'Nein, keinen klassischen Newsletter. In den ersten 30 Tagen schicke ich dir drei bis vier kurze Notizen zum Buch — was Thomas gerade durchmacht, wo es am schwierigsten wird, was du daraus mitnehmen kannst. Nach 30 Tagen ist Schluss, es sei denn du willst mehr lesen.',
  },
  {
    q: 'Kann ich später die Beratung buchen?',
    a: 'Ja, wenn du magst. Das Buch ist der Einstieg; das Erstgespräch ist der direkte Weg. Beide sind unverbindlich.',
  },
  {
    q: 'Wie hängt das mit Wachstumscoach GmbH zusammen?',
    a: 'Wachstumscoach GmbH ist der Beratungsarm. Lukas Ebner schreibt als Autor, coacht als Wachstumscoach. Das Buch ist der Roman zur Beratungsarbeit — wer es liest, kennt die Methode.',
  },
  {
    q: 'Was kostet eure Beratung?',
    a: 'Transparent auf der Preisseite. Startpunkt ist ein kostenloses Erstgespräch.',
  },
]
