'use client'

import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { InlineMarkdown } from '@/components/ui/InlineMarkdown'

/* ── Prototyping Calculator Config ── */
const DAY_RATE = 1000
const TRADITIONAL_DAY_RATE = 1200
const AI_OUTPUT_MULTIPLIER = 3.5
const AGENCY_OVERHEAD = 1.4

interface ProtoExample {
  days: number
  label: string
  description: string
}

const PROTO_EXAMPLES: ProtoExample[] = [
  { days: 1, label: 'Code Review', description: 'Codebase-Audit, Architektur-Feedback, Security-Check oder gezieltes Bug-Fixing' },
  { days: 3, label: 'Landing Page', description: 'Responsive One-Pager mit CMS, Kontaktformular, SEO-Basics und Analytics' },
  { days: 8, label: 'Web-App', description: 'Web-Applikation mit Login, Dashboard, API-Anbindung und Responsive Design' },
  { days: 20, label: 'SaaS MVP', description: 'Funktionierender Prototyp mit User-Management, Abo-Zahlung und den wichtigsten Features' },
  { days: 40, label: 'Ganzes Produkt', description: 'Production-Ready mit allen Features, automatisierten Tests, CI/CD und Monitoring' },
]

function formatCurrency(n: number): string {
  return n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
}

function formatDuration(days: number): string {
  if (days < 5) return `${days} ${days === 1 ? 'Tag' : 'Tage'}`
  const weeks = Math.ceil(days / 5)
  return `${weeks} ${weeks === 1 ? 'Woche' : 'Wochen'}`
}

interface PricingTier {
  label: string
  employees: string
  setup: {
    hoursWeek: string
    hoursMonth: string
    price: string
  }
  ongoing: {
    hoursMonth: string
    price: string
  }
  package3m: string
}

interface PricingTableSlideProps {
  headline: string
  body?: string
  hourlyRate: string
  tiers: PricingTier[]
  footnote?: string
  bafa?: string
  cta?: { label: string; href: string }
  prototypingTab?: boolean
}

function bodyParagraphs(body: string): string[] {
  return body
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 0)
    .map((p) => p.trim())
}

/* ── Compact Prototyping Calculator ── */
function PrototypingCalculator() {
  const [days, setDays] = useState(8)

  const calc = useMemo(() => {
    const ourCost = days * DAY_RATE
    const traditionalWorkDays = Math.round(days * AI_OUTPUT_MULTIPLIER)
    const traditionalCalendarDays = Math.round(traditionalWorkDays * AGENCY_OVERHEAD)
    const traditionalCost = traditionalWorkDays * TRADITIONAL_DAY_RATE
    const savings = traditionalCost - ourCost
    const savingsPercent = Math.round((savings / traditionalCost) * 100)
    const selectedExample = PROTO_EXAMPLES.find((ex) => ex.days === days) ?? null
    return { ourCost, traditionalCost, ourDuration: formatDuration(days), traditionalDuration: formatDuration(traditionalCalendarDays), savings, savingsPercent, selectedExample }
  }, [days])

  return (
    <div className="mt-12">
      {/* Example chips */}
      <p className="mb-3 font-mono text-xs uppercase tracking-wider text-text-muted">
        Beispielprojekte
      </p>
      <div className="flex flex-wrap gap-2">
        {PROTO_EXAMPLES.map((ex) => (
          <button
            key={ex.days}
            onClick={() => setDays(ex.days)}
            className={`rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all lg:text-xs ${
              days === ex.days
                ? 'border-brand bg-brand/10 text-brand'
                : 'border-text-primary/10 text-text-muted hover:border-text-primary/20 hover:text-text-secondary'
            }`}
          >
            {ex.label} · {ex.days}d
          </button>
        ))}
      </div>

      {/* Selected example description – fixed height */}
      <div className="mt-3 min-h-[2.5rem]">
        <AnimatePresence mode="wait">
          {calc.selectedExample && (
            <motion.p
              key={calc.selectedExample.days}
              className="max-w-[560px] font-body text-base leading-relaxed text-text-secondary"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {calc.selectedExample.description}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Slider */}
      <div className="mt-8">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-text-muted">Tage</p>
            <p className="mt-1 font-display text-[2.5rem] font-normal leading-none text-text-primary lg:text-[3.5rem]">
              {days}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs uppercase tracking-wider text-text-muted">Dein Investment</p>
            <p className="mt-1 font-display text-[2.5rem] font-normal leading-none text-text-primary lg:text-[3.5rem]">
              {formatCurrency(calc.ourCost)}
            </p>
          </div>
        </div>
        <input
          type="range"
          min={1}
          max={50}
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="proto-slider w-full cursor-pointer"
        />
      </div>

      {/* Compact comparison */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-green-500/20 bg-green-50 p-6">
          <p className="font-mono text-xs uppercase tracking-wider text-green-700">Mit uns (KI-gestützt)</p>
          <p className="mt-2 font-display text-2xl font-normal text-text-primary lg:text-3xl">{formatCurrency(calc.ourCost)}</p>
          <p className="mt-1 font-body text-sm text-text-secondary">{calc.ourDuration}</p>
        </div>
        <div className="rounded-xl border border-text-primary/5 bg-surface-light p-6">
          <p className="font-mono text-xs uppercase tracking-wider text-text-muted">Klassische Agentur</p>
          <p className="mt-2 font-display text-2xl font-normal text-text-muted lg:text-3xl">{formatCurrency(calc.traditionalCost)}</p>
          <p className="mt-1 font-body text-sm text-text-muted">{calc.traditionalDuration}</p>
        </div>
      </div>

      {/* Savings line */}
      <motion.p
        key={days}
        className="mt-4 font-body text-base text-green-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        Du sparst <span className="font-semibold">{formatCurrency(calc.savings)}</span> ({calc.savingsPercent}% weniger) und bist deutlich schneller.
      </motion.p>

      <p className="mt-6 font-body text-sm italic text-text-muted">
        Tagessatz: {DAY_RATE} € netto (125 €/h × 8h). Vergleich basiert auf durchschnittlichen Agentur-Tagessätzen ({TRADITIONAL_DAY_RATE} €).
      </p>

      {/* Slider styles */}
      <style jsx>{`
        .proto-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 2px;
          outline: none;
        }
        .proto-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--brand, #F44900);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          transition: transform 0.15s ease;
        }
        .proto-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .proto-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--brand, #F44900);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  )
}

export function PricingTableSlide({
  headline,
  body,
  hourlyRate,
  tiers,
  footnote,
  bafa,
  cta,
  prototypingTab,
}: PricingTableSlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const paragraphs = body ? bodyParagraphs(body) : []
  const [activeTab, setActiveTab] = useState<'beratung' | 'prototyping'>('beratung')

  return (
    <div ref={ref} className="bg-white">
      <div className="mx-auto max-w-[1600px] px-8 py-32 lg:px-20 lg:py-48">
        {/* ── Headline ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="max-w-[900px] font-display text-[2.5rem] font-normal leading-[1.1] text-text-primary md:text-[3.5rem] lg:text-[4.25rem]">
            {headline}
          </h2>
          {paragraphs.length > 0 && (
            <div className="mt-8 max-w-[720px] space-y-4">
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="font-body text-lg leading-relaxed text-text-secondary lg:text-xl"
                >
                  {p}
                </p>
              ))}
            </div>
          )}

          {/* Hourly rate callout */}
          <div className="mt-12 inline-flex items-baseline gap-3 rounded-sm bg-surface-light px-6 py-4">
            <span className="font-display text-[2rem] font-normal leading-none text-text-primary lg:text-[2.5rem]">
              {hourlyRate}
            </span>
            <span className="font-body text-base text-text-secondary lg:text-lg">
              / Stunde netto
            </span>
          </div>

          {/* ── Tab Navigation ── */}
          {prototypingTab && (
            <div className="mt-12 flex gap-0">
              <button
                onClick={() => setActiveTab('beratung')}
                className={`relative rounded-l-md border-2 px-6 py-3 font-mono text-sm uppercase tracking-wider transition-all ${
                  activeTab === 'beratung'
                    ? 'z-10 border-brand bg-brand/5 text-brand'
                    : 'border-text-primary/10 text-text-muted hover:border-text-primary/20 hover:text-text-secondary'
                }`}
              >
                Beratungsmandate
              </button>
              <button
                onClick={() => setActiveTab('prototyping')}
                className={`relative rounded-r-md border-2 px-6 py-3 -ml-[2px] font-mono text-sm uppercase tracking-wider transition-all ${
                  activeTab === 'prototyping'
                    ? 'z-10 border-brand bg-brand/5 text-brand'
                    : 'border-text-primary/10 text-text-muted hover:border-text-primary/20 hover:text-text-secondary'
                }`}
              >
                Rapid Prototyping Projekte
              </button>
            </div>
          )}
        </motion.div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          {activeTab === 'beratung' ? (
            <motion.div
              key="beratung"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
        {/* ── Table ── */}
        <motion.div
          className="mt-20 overflow-x-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
        >
          {/* Desktop table */}
          <table className="hidden w-full border-collapse lg:table">
            <thead>
              <tr className="border-b-2 border-text-primary/10">
                <th className="pb-4 pr-8 text-left font-mono text-sm font-normal uppercase tracking-wide text-text-muted">
                  &nbsp;
                </th>
                {tiers.map((tier, i) => (
                  <th
                    key={i}
                    className="pb-4 pr-8 text-left font-mono text-sm font-normal uppercase tracking-wide text-text-muted"
                  >
                    <span className="block font-display text-xl font-normal normal-case tracking-normal text-text-primary lg:text-2xl">
                      {tier.label}
                    </span>
                    <span className="mt-1 block text-xs font-normal normal-case tracking-normal text-text-secondary">
                      {tier.employees}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Setup phase header */}
              <tr>
                <td
                  colSpan={tiers.length + 1}
                  className="pb-2 pt-10 font-mono text-label uppercase tracking-widest text-brand"
                >
                  Setup-Phase (Monat 1–2)
                </td>
              </tr>
              <tr className="border-b border-text-primary/5">
                <td className="py-3 pr-8 font-body text-base text-text-secondary">
                  Stunden / Woche
                </td>
                {tiers.map((tier, i) => (
                  <td
                    key={i}
                    className="py-3 pr-8 font-body text-base font-medium text-text-primary"
                  >
                    {tier.setup.hoursWeek}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-text-primary/5">
                <td className="py-3 pr-8 font-body text-base text-text-secondary">
                  Stunden / Monat
                </td>
                {tiers.map((tier, i) => (
                  <td
                    key={i}
                    className="py-3 pr-8 font-body text-base text-text-primary"
                  >
                    {tier.setup.hoursMonth}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-text-primary/10">
                <td className="py-3 pr-8 font-body text-base text-text-secondary">
                  Monatspreis
                </td>
                {tiers.map((tier, i) => (
                  <td
                    key={i}
                    className="py-3 pr-8 font-display text-xl font-normal text-text-primary"
                  >
                    {tier.setup.price}
                  </td>
                ))}
              </tr>

              {/* Ongoing phase header */}
              <tr>
                <td
                  colSpan={tiers.length + 1}
                  className="pb-2 pt-10 font-mono text-label uppercase tracking-widest text-brand"
                >
                  Laufende Begleitung (ab Monat 3)
                </td>
              </tr>
              <tr className="border-b border-text-primary/5">
                <td className="py-3 pr-8 font-body text-base text-text-secondary">
                  Stunden / Monat
                </td>
                {tiers.map((tier, i) => (
                  <td
                    key={i}
                    className="py-3 pr-8 font-body text-base text-text-primary"
                  >
                    {tier.ongoing.hoursMonth}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-text-primary/10">
                <td className="py-3 pr-8 font-body text-base text-text-secondary">
                  Monatspreis
                </td>
                {tiers.map((tier, i) => (
                  <td
                    key={i}
                    className="py-3 pr-8 font-display text-xl font-normal text-text-primary"
                  >
                    {tier.ongoing.price}
                  </td>
                ))}
              </tr>

              {/* 3-month package */}
              <tr>
                <td
                  colSpan={tiers.length + 1}
                  className="pb-2 pt-10 font-mono text-label uppercase tracking-widest text-brand"
                >
                  3-Monats-Paket (Setup + Übergang)
                </td>
              </tr>
              <tr className="border-b-2 border-text-primary/10">
                <td className="py-3 pr-8 font-body text-base text-text-secondary">
                  Gesamtpreis
                </td>
                {tiers.map((tier, i) => (
                  <td
                    key={i}
                    className="py-3 pr-8 font-display text-2xl font-normal text-text-primary"
                  >
                    {tier.package3m}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          {/* Mobile cards */}
          <div className="grid gap-8 lg:hidden">
            {tiers.map((tier, i) => (
              <div
                key={i}
                className="rounded-lg border border-text-primary/10 p-6"
              >
                <h3 className="font-display text-2xl font-normal text-text-primary">
                  {tier.label}
                </h3>
                <p className="mt-1 font-body text-sm text-text-secondary">
                  {tier.employees}
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-brand">
                      Setup (Monat 1–2)
                    </p>
                    <p className="mt-1 font-body text-sm text-text-secondary">
                      ~{tier.setup.hoursWeek} / Woche · ~{tier.setup.hoursMonth} / Monat
                    </p>
                    <p className="font-display text-xl font-normal text-text-primary">
                      {tier.setup.price}
                      <span className="ml-1 text-base text-text-secondary">/Monat</span>
                    </p>
                  </div>

                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-brand">
                      Laufend (ab Monat 3)
                    </p>
                    <p className="mt-1 font-body text-sm text-text-secondary">
                      ~{tier.ongoing.hoursMonth} / Monat
                    </p>
                    <p className="font-display text-xl font-normal text-text-primary">
                      {tier.ongoing.price}
                      <span className="ml-1 text-base text-text-secondary">/Monat</span>
                    </p>
                  </div>

                  <div className="border-t border-text-primary/10 pt-4">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-brand">
                      3-Monats-Paket
                    </p>
                    <p className="mt-1 font-display text-2xl font-normal text-text-primary">
                      {tier.package3m}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Footnote / BAFA / CTA (Beratung tab) ── */}
        <motion.div
          className="mt-16 max-w-[800px] space-y-6"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
        >
          {footnote && (
            <p className="font-body text-base leading-relaxed text-text-secondary italic">
              {footnote}
            </p>
          )}
          {bafa && (
            <div className="flex items-start gap-5 rounded-sm bg-brand/5 px-6 py-4">
              <Image
                src="/images/BAFA_Label_klein.png"
                alt="BAFA – Bundesamt für Wirtschaft und Ausfuhrkontrolle"
                width={80}
                height={80}
                className="mt-0.5 shrink-0 object-contain"
              />
              <p className="font-body text-base leading-relaxed text-text-primary">
                <span className="font-medium">Fördermöglichkeit:</span>{' '}
                <InlineMarkdown text={bafa} />
              </p>
            </div>
          )}
          {cta && (
            <div className="pt-4">
              <Link
                href={cta.href}
                className="inline-flex rounded-full bg-brand px-8 py-4 font-mono text-sm uppercase tracking-wide text-white transition-opacity hover:opacity-90"
              >
                {cta.label}
              </Link>
            </div>
          )}
        </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="prototyping"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PrototypingCalculator />
              {cta && (
                <div className="mt-10">
                  <Link
                    href={cta.href}
                    className="inline-flex rounded-full bg-brand px-8 py-4 font-mono text-sm uppercase tracking-wide text-white transition-opacity hover:opacity-90"
                  >
                    {cta.label}
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
