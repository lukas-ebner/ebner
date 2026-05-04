'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { getUtmParams } from '@/lib/utm'
import { trackEvent } from '@/lib/track'

interface EbookLeadmagnetSlideProps {
  headline?: string
  subtext?: string
  ebookTitle?: string
  ebookSubtitle?: string
  points?: string[]
  coverImage?: string
  authorImage?: string
  bg?: string
}

function isLightBg(hex: string): boolean {
  const h = hex.replace('#', '')
  if (h.length < 6) return true
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150
}

export function EbookLeadmagnetSlide({
  headline = 'Kostenloser Report: The Cost of Chaos',
  subtext = '10 Fehler, die deine Marge auffressen — und wie du sie abstellen kannst.',
  ebookTitle = 'The Cost of Chaos in Professional Services',
  ebookSubtitle = '10 Failures That Drain Your Margins',
  points = [
    'Warum volle Auslastung nicht gleich Profitabilität ist',
    'Die 10 häufigsten Margenkiller in Agenturen und IT-Dienstleistern',
    'Konkrete Maßnahmen, die du sofort umsetzen kannst',
  ],
  coverImage = '/images/ebook/ebook-title.png',
  authorImage = '/images/ebook/lukas-ebook.jpg',
  bg = '#FFFFFF',
}: EbookLeadmagnetSlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const light = isLightBg(bg)

  const [email, setEmail] = useState('')
  const [phase, setPhase] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [website, setWebsite] = useState('')
  const [formStartedAt] = useState(() => Date.now())

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!email || !email.includes('@') || !email.includes('.')) {
        setErrorMsg('Bitte gib eine gültige E-Mail-Adresse ein.')
        setPhase('error')
        return
      }

      setPhase('sending')
      try {
        const utmData = getUtmParams()
        const res = await fetch('/api/ebook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            website,
            formStartedAt,
            utm: Object.keys(utmData).length > 0 ? utmData : undefined,
          }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Etwas ist schiefgegangen.')
        }

        trackEvent('form_submit_ebook', { form_name: 'cost_of_chaos_ebook' })
        setPhase('success')
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Etwas ist schiefgegangen.')
        setPhase('error')
      }
    },
    [email, formStartedAt, website]
  )

  const txt = light ? 'text-text-primary' : 'text-white'
  const txtMuted = light ? 'text-text-secondary' : 'text-white/60'
  const txtSoft = light ? 'text-text-secondary' : 'text-white/75'
  const pillBorder = light ? 'border-neutral-300' : 'border-white/20'
  const pillText = light ? 'text-neutral-500' : 'text-white/60'

  return (
    <div
      ref={ref}
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: bg }}
    >
      {/* ── Left: Cover image – absolute, full height, flush left ── */}
      <motion.div
        className="hidden lg:flex absolute top-0 bottom-0 left-0 w-[44%] items-center justify-center"
        initial={{ opacity: 0, x: -40 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="relative w-[65%] max-w-[480px]">
          <Image
            src={coverImage}
            alt={ebookTitle}
            width={715}
            height={894}
            className="w-full h-auto"
            style={{
              filter: light
                ? 'drop-shadow(0 20px 50px rgba(0,0,0,0.15))'
                : 'drop-shadow(0 24px 64px rgba(0,0,0,0.6))',
            }}
            priority
          />
        </div>
      </motion.div>

      {/* ── Content layer ── */}
      <div className="relative z-10 flex min-h-screen flex-col justify-center py-section-mobile lg:py-section-desktop">
        <div className="mx-auto w-full max-w-[1800px] px-8 lg:px-16">
          {/* Mobile: show image inline */}
          <motion.div
            className="lg:hidden relative mx-auto mb-10 max-w-[320px]"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <Image
              src={coverImage}
              alt={ebookTitle}
              width={715}
              height={894}
              className="w-full h-auto"
              style={{ filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.12))' }}
              priority
            />
          </motion.div>

          {/* Text + Form – pushed to the right on desktop */}
          <motion.div
            className="lg:w-[52%] lg:ml-auto lg:pl-8"
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          >
            {/* Pill */}
            <div
              className={`mb-5 inline-block rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-widest ${pillBorder} ${pillText}`}
            >
              Kostenloser Report
            </div>

            {/* Headline */}
            <h2
              className={`max-w-[640px] font-display text-[1.8rem] font-normal leading-[1.1] md:text-[2.4rem] lg:text-[2.8rem] ${txt}`}
            >
              {headline}
            </h2>

            {/* Subtext */}
            <p className={`mt-4 max-w-[560px] font-body text-lg leading-relaxed ${txtMuted}`}>
              {subtext}
            </p>

            {/* Points */}
            {points.length > 0 && (
              <ul className="mt-6 space-y-2.5">
                {points.map((point, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -12 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  >
                    <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#F44900]" />
                    <span className={`font-body text-base ${txtSoft}`}>{point}</span>
                  </motion.li>
                ))}
              </ul>
            )}

            {/* ── Email Form ── */}
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              {phase === 'success' ? (
                <div
                  className={`rounded-xl border px-6 py-5 ${light ? 'border-green-600/30 bg-green-50' : 'border-green-500/30 bg-green-500/10'}`}
                >
                  <p
                    className={`font-body text-lg font-medium ${light ? 'text-green-700' : 'text-green-400'}`}
                  >
                    Check dein Postfach!
                  </p>
                  <p
                    className={`mt-1 font-body text-sm ${light ? 'text-green-600/70' : 'text-green-400/70'}`}
                  >
                    Der Report ist auf dem Weg zu {email}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="max-w-[520px]">
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="hidden"
                  />
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (phase === 'error') setPhase('idle')
                      }}
                      placeholder="deine@email.de"
                      required
                      className={`flex-1 rounded-lg border px-4 py-3.5 font-body text-base outline-none transition-colors focus:border-[#F44900]/50 ${
                        light
                          ? 'border-neutral-300 bg-neutral-50 text-text-primary placeholder-neutral-400 focus:bg-white'
                          : 'border-white/15 bg-white/5 text-white placeholder-white/30 backdrop-blur-sm focus:bg-white/8'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={phase === 'sending'}
                      className="whitespace-nowrap rounded-lg bg-[#F44900] px-6 py-3.5 font-body text-sm font-semibold uppercase tracking-wider text-white transition-all hover:bg-[#E04000] disabled:opacity-50"
                    >
                      {phase === 'sending' ? (
                        <span className="flex items-center gap-2">
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Wird gesendet…
                        </span>
                      ) : (
                        'Report anfordern'
                      )}
                    </button>
                  </div>

                  {phase === 'error' && (
                    <p className="mt-2 font-body text-sm text-red-500">{errorMsg}</p>
                  )}

                  <p
                    className={`mt-3 font-body text-xs ${light ? 'text-neutral-400' : 'text-white/30'}`}
                  >
                    Kein Spam. Nur der Report. Du kannst dich jederzeit abmelden.
                  </p>
                </form>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
