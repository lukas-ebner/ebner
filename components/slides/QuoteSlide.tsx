'use client'

import { motion } from 'framer-motion'

interface QuoteSlideProps {
  quote: string
  attribution?: string
  variant?: 'light' | 'dark' | 'brand'
}

export function QuoteSlide({
  quote,
  attribution,
  variant = 'light',
}: QuoteSlideProps) {
  const sectionBg =
    variant === 'dark'
      ? 'bg-surface-dark'
      : variant === 'brand'
        ? 'bg-brand'
        : 'bg-surface-light'

  const quoteText =
    variant === 'light' ? 'text-text-primary' : 'text-text-light'
  const attributionClass =
    variant === 'light' ? 'text-text-muted' : 'text-text-light/60'
  const decoQuote =
    variant === 'light' ? 'text-brand/20' : 'text-white/15'

  return (
    <div className={`relative py-section-mobile lg:py-section-desktop ${sectionBg}`}>
      <div className="relative mx-auto max-w-4xl px-6">
        <span
          className={`pointer-events-none absolute -left-4 -top-8 font-display text-[120px] leading-none lg:text-[180px] ${decoQuote}`}
          aria-hidden
        >
          &ldquo;
        </span>
        <motion.blockquote
          className="relative z-10 border-l-4 border-brand pl-8 lg:pl-12"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className={`font-display text-h2 font-normal leading-tight lg:text-h1 ${quoteText}`}>
            {quote}
          </p>
          {attribution ? (
            <footer className={`mt-8 font-mono text-label uppercase tracking-widest ${attributionClass}`}>
              {attribution}
            </footer>
          ) : null}
        </motion.blockquote>
      </div>
    </div>
  )
}
