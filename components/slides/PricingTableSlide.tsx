'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

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
}

function bodyParagraphs(body: string): string[] {
  return body
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 0)
    .map((p) => p.trim())
}

export function PricingTableSlide({
  headline,
  body,
  hourlyRate,
  tiers,
  footnote,
  bafa,
  cta,
}: PricingTableSlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const paragraphs = body ? bodyParagraphs(body) : []

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
        </motion.div>

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

        {/* ── Footnote / BAFA / CTA ── */}
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
                {bafa}
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
      </div>
    </div>
  )
}
