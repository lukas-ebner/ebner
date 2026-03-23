'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'

interface PricingTier {
  label: string
  employees: string
  price: string
  suffix?: string
}

interface PricingTeaserSlideProps {
  headline: string
  body?: string
  hourlyRate?: string
  tiers: PricingTier[]
  footnote?: string
  cta?: { label: string; href: string }
  variant?: 'light' | 'dark'
}

export function PricingTeaserSlide({
  headline,
  body,
  hourlyRate,
  tiers,
  footnote,
  cta,
  variant = 'light',
}: PricingTeaserSlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const isDark = variant === 'dark'

  return (
    <div
      ref={ref}
      className={`flex min-h-screen flex-col justify-center ${
        isDark ? 'bg-surface-dark' : 'bg-surface-light'
      }`}
    >
      <div className="mx-auto w-full max-w-[1600px] px-8 py-32 lg:px-20 lg:py-40">
        {/* ── Header ── */}
        <motion.div
          className="mb-20 lg:mb-28"
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2
            className={`max-w-[800px] font-display text-[2.5rem] font-normal leading-[1.1] md:text-[3.5rem] lg:text-[4.25rem] ${
              isDark ? 'text-text-light' : 'text-text-primary'
            }`}
          >
            {headline}
          </h2>
          {body && (
            <p
              className={`mt-6 max-w-[600px] font-body text-lg leading-relaxed lg:text-xl ${
                isDark ? 'text-text-light/60' : 'text-text-secondary'
              }`}
            >
              {body}
            </p>
          )}
        </motion.div>

        {/* ── Pricing Cards ── */}
        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
        >
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`group rounded-lg border p-8 transition-colors lg:p-10 ${
                isDark
                  ? 'border-white/10 hover:border-white/20'
                  : 'border-text-primary/10 hover:border-text-primary/20'
              }`}
            >
              {/* Tier label */}
              <div className="mb-8">
                <span
                  className={`font-display text-[3rem] font-normal leading-none lg:text-[3.5rem] ${
                    isDark ? 'text-white/20' : 'text-text-primary/15'
                  }`}
                >
                  {tier.label}
                </span>
                <p
                  className={`mt-2 font-body text-sm ${
                    isDark ? 'text-text-light/50' : 'text-text-secondary'
                  }`}
                >
                  {tier.employees}
                </p>
              </div>

              {/* Price */}
              <div className="mb-3">
                <span
                  className={`font-display text-[2.5rem] font-normal leading-none lg:text-[3rem] ${
                    isDark ? 'text-text-light' : 'text-text-primary'
                  }`}
                >
                  {tier.price}
                </span>
              </div>
              <p
                className={`font-body text-sm ${
                  isDark ? 'text-text-light/40' : 'text-text-muted'
                }`}
              >
                {tier.suffix || '3-Monats-Paket'}
              </p>
            </div>
          ))}
        </motion.div>

        {/* ── Hourly rate + footnote ── */}
        <motion.div
          className="mt-12 flex flex-col gap-6 lg:mt-16 lg:flex-row lg:items-end lg:justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
        >
          <div className="space-y-3">
            {hourlyRate && (
              <p
                className={`font-body text-lg ${
                  isDark ? 'text-text-light/70' : 'text-text-secondary'
                }`}
              >
                Stundensatz:{' '}
                <span
                  className={`font-display text-2xl font-normal ${
                    isDark ? 'text-text-light' : 'text-text-primary'
                  }`}
                >
                  {hourlyRate}
                </span>
                <span className="text-base"> / Stunde netto</span>
              </p>
            )}
            {footnote && (
              <p
                className={`max-w-[600px] font-body text-sm leading-relaxed italic ${
                  isDark ? 'text-text-light/40' : 'text-text-muted'
                }`}
              >
                {footnote}
              </p>
            )}
          </div>

          {cta && (
            <Link
              href={cta.href}
              className={`inline-flex shrink-0 rounded-full px-8 py-4 font-mono text-sm uppercase tracking-wide transition-opacity hover:opacity-90 ${
                isDark
                  ? 'bg-brand text-white'
                  : 'bg-brand text-white'
              }`}
            >
              {cta.label}
            </Link>
          )}
        </motion.div>
      </div>
    </div>
  )
}
