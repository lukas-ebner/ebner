'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface TextBlockSlideProps {
  headline: string
  body: string
  /** 'light' = heller Hintergrund, 'dark' = dunkler Hintergrund */
  variant?: 'light' | 'dark'
  /** Text-Ausrichtung */
  align?: 'left' | 'center'
  /** Optionaler Pill / Label über der Headline */
  pill?: string
}

function bodyParagraphs(body: string): string[] {
  return body.split(/\n\n+/).filter((p) => p.trim().length > 0).map((p) => p.trim())
}

export function TextBlockSlide({
  headline,
  body,
  variant = 'light',
  align = 'left',
  pill,
}: TextBlockSlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const isDark = variant === 'dark'
  const isCenter = align === 'center'

  const paragraphs = bodyParagraphs(body)

  return (
    <div
      ref={ref}
      className={`py-section-mobile lg:py-section-desktop ${
        isDark ? 'bg-surface-dark text-text-light' : 'bg-white text-text-primary'
      }`}
    >
      <motion.div
        className={`mx-auto max-w-[780px] px-8 lg:px-12 ${isCenter ? 'text-center' : ''}`}
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        {pill ? (
          <p
            className={`mb-4 font-mono text-label uppercase tracking-widest ${
              isDark ? 'text-brand' : 'text-brand'
            }`}
          >
            {pill}
          </p>
        ) : null}

        <h2
          className={`font-display text-h2 font-normal leading-tight lg:text-h1 ${
            isDark ? 'text-text-light' : 'text-text-primary'
          }`}
        >
          {headline}
        </h2>

        <div className="mt-8 space-y-5">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className={`font-body text-lg leading-relaxed lg:text-xl ${
                isDark ? 'text-text-light/80' : 'text-text-secondary'
              }`}
            >
              {p}
            </p>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
