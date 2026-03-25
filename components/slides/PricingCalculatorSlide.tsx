'use client'

import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState, useMemo } from 'react'
import Link from 'next/link'

/* ── Config ── */
const DAY_RATE = 1000 // 125€/h × 8h
const TRADITIONAL_DAY_RATE = 1200 // realistischer Agentur-Tagessatz (DE Durchschnitt 1.000–1.400€)
const AI_OUTPUT_MULTIPLIER = 3.5 // KI-Entwicklung produziert ~3.5x mehr Output pro Tag
const AGENCY_OVERHEAD = 1.4 // Agenturen brauchen ~40% mehr Kalendertage (Meetings, Sprints, QA)

interface Example {
  days: number
  label: string
  description: string
}

const EXAMPLES: Example[] = [
  { days: 1, label: 'Code Review', description: 'Codebase-Audit, Architektur-Feedback, Security-Check oder gezieltes Bug-Fixing' },
  { days: 3, label: 'Landing Page', description: 'Responsive One-Pager mit CMS, Kontaktformular, SEO-Basics und Analytics' },
  { days: 8, label: 'Web-App', description: 'Web-Applikation mit Login, Dashboard, API-Anbindung und Responsive Design' },
  { days: 20, label: 'SaaS MVP', description: 'Funktionierender Prototyp mit User-Management, Abo-Zahlung und den wichtigsten Features' },
  { days: 40, label: 'Ganzes Produkt', description: 'Production-Ready mit allen Features, automatisierten Tests, CI/CD und Monitoring' },
]

function findExactExample(days: number): Example | null {
  return EXAMPLES.find((ex) => ex.days === days) ?? null
}

function formatCurrency(n: number): string {
  return n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
}

function formatDuration(days: number): string {
  if (days < 5) return `${days} ${days === 1 ? 'Tag' : 'Tage'}`
  const weeks = Math.ceil(days / 5)
  return `${weeks} ${weeks === 1 ? 'Woche' : 'Wochen'}`
}

interface PricingCalculatorSlideProps {
  headline?: string
  body?: string
  cta?: { label: string; href: string }
}

export function PricingCalculatorSlide({
  headline = '10x schneller. Zum Bruchteil.',
  body,
  cta,
}: PricingCalculatorSlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [days, setDays] = useState(10)

  const calc = useMemo(() => {
    const ourCost = days * DAY_RATE
    // Klassische Agentur: gleicher Scope braucht 3.5x so viele Arbeitstage
    const traditionalWorkDays = Math.round(days * AI_OUTPUT_MULTIPLIER)
    // Plus Overhead (Meetings, Sprint-Planung, QA-Zyklen, Abstimmung)
    const traditionalCalendarDays = Math.round(traditionalWorkDays * AGENCY_OVERHEAD)
    const traditionalCost = traditionalWorkDays * TRADITIONAL_DAY_RATE
    const savings = traditionalCost - ourCost
    const savingsPercent = Math.round((savings / traditionalCost) * 100)
    const selectedExample = findExactExample(days)
    const timeFasterDays = traditionalCalendarDays - days

    return {
      ourCost,
      ourDuration: formatDuration(days),
      traditionalWorkDays,
      traditionalCost,
      traditionalDuration: formatDuration(traditionalCalendarDays),
      timeFaster: formatDuration(timeFasterDays),
      savings,
      savingsPercent,
      selectedExample,
    }
  }, [days])

  return (
    <div
      ref={ref}
      className="flex min-h-screen flex-col justify-center"
      style={{ backgroundColor: 'var(--accent, #1B1464)' }}
    >
      <div className="mx-auto w-full max-w-[1600px] px-8 py-32 lg:px-20 lg:py-40">
        {/* ── Header ── */}
        <motion.div
          className="mb-10 lg:mb-14"
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="max-w-[800px] font-display text-[2.5rem] font-normal leading-[1.1] text-text-light md:text-[3.5rem] lg:text-[4.25rem]">
            {headline}
          </h2>
          {body && (
            <p className="mt-6 max-w-[560px] font-body text-lg leading-relaxed text-text-light/60 lg:text-xl">
              {body}
            </p>
          )}

          {/* ── Beispielprojekte (chips) ── */}
          <div className="mt-8">
            <p className="mb-3 font-mono text-xs uppercase tracking-wider text-text-light/40">
              Beispielprojekte
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => {
                const isActive = days === ex.days
                return (
                  <button
                    key={ex.days}
                    onClick={() => setDays(ex.days)}
                    className={`rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all lg:text-xs ${
                      isActive
                        ? 'border-white/30 bg-white/10 text-text-light'
                        : 'border-white/10 text-text-light/30 hover:border-white/20 hover:text-text-light/60'
                    }`}
                  >
                    {ex.label} · {ex.days}d
                  </button>
                )
              })}
            </div>

            {/* Selected example description – fixed height to prevent layout shift */}
            <div className="mt-4 min-h-[3.5rem]">
              <AnimatePresence mode="wait">
                {calc.selectedExample && (
                  <motion.p
                    key={calc.selectedExample.days}
                    className="max-w-[560px] font-body text-base leading-relaxed text-text-light/50 lg:text-lg"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    {calc.selectedExample.label}: {calc.selectedExample.description}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* ── Calculator ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
        >
          {/* Slider area */}
          <div className="mb-16">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="font-mono text-sm uppercase tracking-wider text-text-light/40">
                  Tage
                </p>
                <p className="mt-1 font-display text-[3.5rem] font-normal leading-none text-text-light lg:text-[5rem]">
                  {days}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm uppercase tracking-wider text-text-light/40">
                  Dein Investment
                </p>
                <p className="mt-1 font-display text-[3.5rem] font-normal leading-none text-text-light lg:text-[5rem]">
                  {formatCurrency(calc.ourCost)}
                </p>
              </div>
            </div>

            {/* Slider */}
            <div className="relative mt-8">
              <input
                type="range"
                min={1}
                max={50}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="pricing-slider w-full cursor-pointer"
              />
            </div>
          </div>

          {/* Comparison cards */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Our way */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8.5L6.5 12L13 4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="font-mono text-sm uppercase tracking-wider text-green-400">
                  Mit uns (KI-gestützt)
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-text-light/40">
                    Zeitaufwand
                  </p>
                  <p className="mt-1 font-display text-3xl font-normal text-text-light lg:text-4xl">
                    {calc.ourDuration}
                  </p>
                </div>

                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-text-light/40">
                    Kosten
                  </p>
                  <p className="mt-1 font-display text-3xl font-normal text-text-light lg:text-4xl">
                    {formatCurrency(calc.ourCost)}
                  </p>
                </div>
              </div>
            </div>

            {/* Traditional way */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 12L12 4M4 4L12 12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="font-mono text-sm uppercase tracking-wider text-red-400/70">
                  Klassische Agentur
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-text-light/40">
                    Zeitaufwand (gleiches Ergebnis)
                  </p>
                  <p className="mt-1 font-display text-3xl font-normal text-text-light/40 lg:text-4xl">
                    {calc.traditionalDuration}
                  </p>
                </div>

                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-text-light/40">
                    Kosten
                  </p>
                  <p className="mt-1 font-display text-3xl font-normal text-text-light/40 lg:text-4xl">
                    {formatCurrency(calc.traditionalCost)}
                  </p>
                </div>

                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-text-light/40">
                    Gleicher Scope, anderer Weg
                  </p>
                  <p className="mt-2 font-body text-base leading-relaxed text-text-light/30 lg:text-lg">
                    Team-Meetings, Sprints, Abstimmungsrunden. Mehr Leute, längere Timelines, höhere Kosten.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Savings banner */}
          <motion.div
            className="mt-8 rounded-2xl border border-green-500/20 bg-green-500/5 px-8 py-6 lg:px-10"
            key={days}
            initial={{ scale: 0.98, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div>
                <p className="font-mono text-sm uppercase tracking-wider text-green-400">
                  Du sparst
                </p>
                <p className="mt-1 font-display text-3xl font-normal text-green-400 lg:text-4xl">
                  {formatCurrency(calc.savings)}
                </p>
              </div>
              <div className="text-center sm:text-right">
                <p className="font-body text-base text-text-light/50 lg:text-lg">
                  Das sind <span className="font-semibold text-green-400">{calc.savingsPercent}% weniger</span> als der klassische Weg
                </p>
                <p className="mt-1 font-body text-base text-text-light/50 lg:text-lg">
                  und <span className="font-semibold text-green-400">{calc.timeFaster} schneller</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Footnote + CTA */}
          <div className="mt-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <p className="font-body text-sm italic text-text-light/30">
              Tagessatz: {DAY_RATE} € netto (125 €/h × 8h). Vergleich basiert auf durchschnittlichen Agentur-Tagessätzen ({TRADITIONAL_DAY_RATE} €) und realistischen Aufwandsschätzungen.
              Im Erstgespräch klären wir deinen konkreten Bedarf.
            </p>
            {cta && (
              <Link
                href={cta.href}
                className="inline-block shrink-0 rounded-full bg-accent px-8 py-4 font-mono text-sm font-semibold uppercase tracking-wide text-white transition-transform hover:scale-105"
                style={{ backgroundColor: '#F44900' }}
              >
                {cta.label}
              </Link>
            )}
          </div>
        </motion.div>
      </div>

      {/* Slider custom styles */}
      <style jsx>{`
        .pricing-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          outline: none;
        }
        .pricing-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          transition: transform 0.15s ease;
        }
        .pricing-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .pricing-slider::-webkit-slider-thumb:active {
          transform: scale(1.05);
        }
        .pricing-slider::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  )
}
