'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Pill } from '@/components/ui/Pill'
import { getIcon } from '@/lib/icons'

interface CardCta {
  text: string
  url: string
}

interface GridCard {
  icon?: string
  pill?: string
  title: string
  body: string
  cta?: CardCta
}

interface CardsGridSlideProps {
  headline: string
  subtext?: string
  variant?: 'light' | 'dark'
  cards: GridCard[]
}

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' as const },
  },
}

export function CardsGridSlide({
  headline,
  subtext,
  variant = 'light',
  cards,
}: CardsGridSlideProps) {
  const isDark = variant === 'dark'
  const sectionBg = isDark ? 'bg-surface-dark' : 'bg-surface-light'
  const headlineClass = isDark ? 'text-text-light' : 'text-text-primary'
  const subtextClass = isDark ? 'text-text-muted' : 'text-text-muted'
  const gridCols =
    cards.length >= 4
      ? 'md:grid-cols-2 lg:grid-cols-4'
      : 'md:grid-cols-2 lg:grid-cols-3'

  const cardShell = isDark
    ? 'bg-surface-dark border border-border-dark rounded-card p-8 transition-all duration-200 hover:border-brand/50'
    : 'bg-white rounded-card p-8 shadow-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-lg'

  const titleClass = isDark ? 'text-text-light' : 'text-text-primary'
  const bodyClass = 'text-text-muted'

  return (
    <div className={`py-section-mobile lg:py-section-desktop ${sectionBg}`}>
      <div className="mx-auto max-w-6xl px-6">
        <h2
          className={`text-center font-display text-h2 font-bold ${headlineClass}`}
        >
          {headline}
        </h2>
        {subtext ? (
          <p
            className={`mx-auto mt-4 max-w-2xl text-center font-body text-body ${subtextClass}`}
          >
            {subtext}
          </p>
        ) : null}

        <motion.ul
          className={`mt-12 grid grid-cols-1 gap-6 ${gridCols}`}
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {cards.map((card, i) => {
            const Icon = card.icon ? getIcon(card.icon) : null
            return (
              <motion.li key={`${card.title}-${i}`} variants={cardVariants}>
                <div className={cardShell}>
                  {Icon ? (
                    <Icon className="mb-4 h-10 w-10 text-brand" aria-hidden />
                  ) : null}
                  {card.pill ? (
                    <div className="mb-3">
                      <Pill variant={isDark ? 'dark' : 'default'}>{card.pill}</Pill>
                    </div>
                  ) : null}
                  <h3 className={`font-display text-h3 font-bold ${titleClass}`}>
                    {card.title}
                  </h3>
                  <p className={`mt-2 font-body text-body ${bodyClass}`}>{card.body}</p>
                  {card.cta ? (
                    <div className="mt-4">
                      {isExternalUrl(card.cta.url) ? (
                        <a
                          href={card.cta.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-label uppercase tracking-wide text-brand hover:underline"
                        >
                          {card.cta.text}
                          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                        </a>
                      ) : (
                        <Link
                          href={card.cta.url}
                          className="inline-flex items-center gap-1 font-mono text-label uppercase tracking-wide text-brand hover:underline"
                        >
                          {card.cta.text}
                          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                        </Link>
                      )}
                    </div>
                  ) : null}
                </div>
              </motion.li>
            )
          })}
        </motion.ul>
      </div>
    </div>
  )
}
