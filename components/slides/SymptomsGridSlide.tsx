'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import {
  Repeat,
  BarChart3,
  Layers,
  Clock,
  TrendingUp,
  Code,
  Lightbulb,
  Gauge,
  type LucideIcon,
} from 'lucide-react'

/* ── Icon map ── */
const ICON_MAP: Record<string, LucideIcon> = {
  repeat: Repeat,
  'bar-chart-3': BarChart3,
  layers: Layers,
  clock: Clock,
  'trending-up': TrendingUp,
  code: Code,
  lightbulb: Lightbulb,
  gauge: Gauge,
}

interface Symptom {
  pill: string
  headline: string
  body: string
  icon?: string
  image?: string
}

interface SymptomsGridSlideProps {
  headline?: string
  body?: string
  symptoms: Symptom[]
}

function bodyParagraphs(body: string): string[] {
  return body
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 0)
    .map((p) => p.trim())
}

export function SymptomsGridSlide({
  headline,
  body,
  symptoms,
}: SymptomsGridSlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const introParagraphs = body ? bodyParagraphs(body) : []
  const hasIntro = headline || introParagraphs.length > 0

  return (
    <div ref={ref} className="bg-white">
      <div className="mx-auto max-w-[1600px] px-8 py-32 lg:px-20 lg:py-48">
        {/* ── Optional Headline + Body ── */}
        {hasIntro && (
          <motion.div
            className="mb-20 lg:mb-28"
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {headline && (
              <h2 className="max-w-[720px] font-display text-[2.5rem] font-normal leading-[1.1] text-text-primary md:text-[3.5rem] lg:text-[4.25rem]">
                {headline}
              </h2>
            )}
            {introParagraphs.length > 0 && (
              <div className="mt-8 max-w-[640px] space-y-4">
                {introParagraphs.map((p, i) => (
                  <p
                    key={i}
                    className="font-body text-lg leading-relaxed text-text-secondary lg:text-xl"
                  >
                    {p}
                  </p>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── 2×2 Grid ── */}
        <div className="grid grid-cols-1 gap-x-20 gap-y-16 md:grid-cols-2 lg:gap-y-20">
          {symptoms.map((symptom, i) => {
            const paragraphs = bodyParagraphs(symptom.body)
            const Icon = symptom.icon ? ICON_MAP[symptom.icon] : undefined
            const hasImage = !!symptom.image
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  ease: 'easeOut',
                  delay: 0.15 + i * 0.1,
                }}
              >
                {/* Photo circle (large) — takes priority over icon */}
                {hasImage && (
                  <div className="relative mb-6 h-28 w-28 overflow-hidden rounded-full">
                    <Image
                      src={symptom.image!}
                      alt={symptom.headline}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>
                )}
                {/* Icon circle (fallback when no image) */}
                {!hasImage && Icon && (
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border-[1.5px] border-text-primary">
                    <Icon
                      className="h-6 w-6 text-text-primary"
                      strokeWidth={1.5}
                    />
                  </div>
                )}
                <span className="mb-3 block font-mono text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                  {symptom.pill}
                </span>
                <h3 className="font-display text-[1.5rem] font-normal leading-[1.15] text-text-primary md:text-[1.75rem] lg:text-[2rem]">
                  {symptom.headline}
                </h3>
                <div className="mt-4 space-y-3">
                  {paragraphs.map((p, j) => (
                    <p
                      key={j}
                      className="font-body text-base leading-relaxed text-text-secondary"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
