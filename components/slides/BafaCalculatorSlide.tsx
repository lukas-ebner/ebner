'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

function eur(v: number): string {
  return v.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
}

interface BafaCalculatorSlideProps {
  headline?: string
  body?: string
  cta?: { label: string; href: string }
}

export function BafaCalculatorSlide({
  headline = 'Rechne den BAFA-Effekt auf euren Fall.',
  body,
  cta,
}: BafaCalculatorSlideProps) {
  const [beratungskosten, setBeratungskosten] = useState(3500)
  const [foerdersatz, setFoerdersatz] = useState(80)

  const calc = useMemo(() => {
    const quote = foerdersatz / 100
    const maxFoerderfaehig = 2800
    const foerderfaehigeKosten = Math.min(beratungskosten, maxFoerderfaehig)
    const zuschuss = foerderfaehigeKosten * quote
    const eigenanteil = beratungskosten - zuschuss
    return { zuschuss, eigenanteil, maxFoerderfaehig, foerderfaehigeKosten }
  }, [beratungskosten, foerdersatz])

  return (
    <section className="flex min-h-screen flex-col justify-center" style={{ backgroundColor: 'var(--accent, #F44900)' }}>
      <div className="mx-auto w-full max-w-6xl px-8 py-24 lg:px-12">
        <h2 className="max-w-4xl font-display text-4xl leading-tight text-white lg:text-6xl">{headline}</h2>
        {body && <p className="mt-6 max-w-3xl text-lg text-white/80 lg:text-xl">{body}</p>}

        <div className="mt-12 grid gap-8 rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur lg:grid-cols-2 lg:p-10">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-white/70">Beratungskosten</p>
            <p className="mt-2 font-display text-4xl text-white">{eur(beratungskosten)}</p>
            <input
              type="range"
              min={1000}
              max={50000}
              step={100}
              value={beratungskosten}
              onChange={(e) => setBeratungskosten(Number(e.target.value))}
              className="mt-6 w-full"
              aria-label="Beratungskosten"
            />
            <p className="mt-2 text-sm text-white/70">1.000 € bis 50.000 €</p>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-white/70">Fördersatz</p>
            <p className="mt-2 font-display text-4xl text-white">{foerdersatz}%</p>
            <input
              type="range"
              min={50}
              max={80}
              step={30}
              value={foerdersatz}
              onChange={(e) => setFoerdersatz(Number(e.target.value))}
              className="mt-6 w-full"
              aria-label="Fördersatz"
            />
            <p className="mt-2 text-sm text-white/70">50% oder 80%</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-5">
            <p className="text-sm text-white/70">Beratungskosten</p>
            <p className="mt-1 text-3xl font-semibold text-white">{eur(beratungskosten)}</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-5">
            <p className="text-sm text-white/70">Möglicher Zuschuss</p>
            <p className="mt-1 text-3xl font-semibold text-white">{eur(calc.zuschuss)}</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-5">
            <p className="text-sm text-white/70">Voraussichtlicher Eigenanteil</p>
            <p className="mt-1 text-3xl font-semibold text-white">{eur(calc.eigenanteil)}</p>
          </div>
        </div>

        <p className="mt-6 text-sm text-white/80">
          Hinweis: Förderfähigkeit muss im Einzelfall geprüft werden. Aktuell maximal förderfähiger Beratungsbetrag: {eur(calc.maxFoerderfaehig)}.
        </p>
        {beratungskosten > calc.maxFoerderfaehig && (
          <p className="mt-2 text-sm text-yellow-200/90">
            Hinweis: BAFA bezuschusst max. {eur(calc.maxFoerderfaehig)} der Beratungskosten. Mehrkosten {eur(beratungskosten - calc.maxFoerderfaehig)} tragt ihr selbst.
          </p>
        )}

        {cta && (
          <Link href={cta.href} className="mt-8 inline-block rounded-full bg-white px-8 py-4 font-mono text-sm uppercase tracking-wide text-[#1B1464]">
            {cta.label}
          </Link>
        )}
      </div>
    </section>
  )
}
