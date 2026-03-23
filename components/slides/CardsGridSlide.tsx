'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Pill } from '@/components/ui/Pill'
import { getIcon } from '@/lib/icons'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'

interface CardCta {
  text: string
  url: string
}

interface CardImage {
  src: string
  alt?: string
}

interface GridCard {
  icon?: string
  pill?: string
  title: string
  body: string
  cta?: CardCta
  image?: CardImage
}

interface CardsGridSlideProps {
  headline: string
  subtext?: string
  variant?: 'light' | 'dark'
  cards: GridCard[]
  cardVariant?: 'default' | 'numbered' | 'minimal' | 'image'
}

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

function gridColsClass(n: number, variant?: string): string {
  if (variant === 'numbered') return 'md:grid-cols-2'
  if (variant === 'image') return n <= 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'
  if (n <= 3) return 'md:grid-cols-2 lg:grid-cols-3'
  if (n === 4) return 'md:grid-cols-2 lg:grid-cols-4'
  return 'md:grid-cols-2 lg:grid-cols-3'
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
  cardVariant = 'default',
}: CardsGridSlideProps) {
  const isDark = variant === 'dark'
  const sectionBg = isDark ? 'bg-surface-dark' : 'bg-surface-light'
  const headlineClass = isDark ? 'text-text-light' : 'text-text-primary'
  const subtextClass = isDark ? 'text-text-muted' : 'text-text-muted'
  const titleClass = isDark ? 'text-text-light' : 'text-text-primary'
  const bodyClass = isDark ? 'text-text-muted' : 'text-text-dimmed'
  const gridCols = gridColsClass(cards.length, cardVariant)

  const defaultShell = isDark
    ? 'h-full flex-col rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all duration-200 hover:border-brand/50'
    : 'h-full flex-col rounded-card bg-white p-8 shadow-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-lg'

  const numberedShell = isDark
    ? 'h-full flex-col p-2 transition-all duration-200'
    : 'h-full flex-col p-2 transition-all duration-200'

  const minimalShell = isDark
    ? 'h-full flex-col border-t-2 border-brand bg-transparent pt-6'
    : 'h-full flex-col border-t-2 border-brand bg-transparent pt-6'

  const cardShell =
    cardVariant === 'minimal'
      ? minimalShell
      : cardVariant === 'numbered'
        ? numberedShell
        : defaultShell

  return (
    <div className={`py-section-mobile lg:py-section-desktop ${sectionBg}`}>
      <div className="mx-auto max-w-6xl px-6">
        <h2
          className={`text-center font-display text-h2 font-normal ${headlineClass}`}
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
          className={`mt-12 grid grid-cols-1 items-stretch gap-6 ${gridCols}`}
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {cards.map((card, i) => {
            const Icon = card.icon ? getIcon(card.icon) : null
            const showNumber = cardVariant === 'numbered'
            const isImageCard = cardVariant === 'image' && card.image

            if (isImageCard) {
              const inner = (
                <div className="group relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl">
                  {/* Background image */}
                  <div className="absolute inset-0">
                    <ImageWithFallback
                      src={card.image!.src}
                      alt={card.image!.alt ?? card.title}
                      fill
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      label={card.title}
                    />
                  </div>
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  {/* Content pinned to bottom */}
                  <div className="relative z-10 mt-auto p-8">
                    {card.pill ? (
                      <div className="mb-3">
                        <Pill variant="dark">{card.pill}</Pill>
                      </div>
                    ) : null}
                    <h3 className="font-display text-h3 font-semibold text-text-light">
                      {card.title}
                    </h3>
                    <p className="mt-2 max-w-md font-body text-sm leading-relaxed text-text-light/70">
                      {card.body}
                    </p>
                    {card.cta ? (
                      <div className="mt-4">
                        <span className="inline-flex items-center gap-1 font-mono text-label uppercase tracking-wide text-brand hover:underline">
                          {card.cta.text}
                          <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              )

              return (
                <motion.li
                  key={`${card.title}-${i}`}
                  className="h-full"
                  variants={cardVariants}
                >
                  {card.cta ? (
                    isExternalUrl(card.cta.url) ? (
                      <a href={card.cta.url} target="_blank" rel="noopener noreferrer" className="block h-full">
                        {inner}
                      </a>
                    ) : (
                      <Link href={card.cta.url} className="block h-full">
                        {inner}
                      </Link>
                    )
                  ) : (
                    inner
                  )}
                </motion.li>
              )
            }

            return (
              <motion.li
                key={`${card.title}-${i}`}
                className="h-full"
                variants={cardVariants}
              >
                <div className={`flex h-full flex-col ${cardShell}`}>
                  {showNumber ? (
                    <span className="font-display text-[56px] font-bold leading-none text-brand/20">
                      {i + 1}
                    </span>
                  ) : Icon ? (
                    <Icon
                      className="mb-4 h-6 w-6 text-brand"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  ) : null}
                  {card.pill ? (
                    <div className="mb-3">
                      <Pill variant={isDark ? 'dark' : 'default'}>{card.pill}</Pill>
                    </div>
                  ) : null}
                  <h3
                    className={`font-display font-semibold ${titleClass} ${
                      showNumber ? 'text-h2' : 'text-h3'
                    }`}
                  >
                    {card.title}
                  </h3>
                  <p
                    className={`mt-3 flex-1 font-body text-body leading-relaxed ${bodyClass}`}
                  >
                    {card.body}
                  </p>
                  {card.cta ? (
                    <div className="mt-6 shrink-0">
                      {isExternalUrl(card.cta.url) ? (
                        <a
                          href={card.cta.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-label uppercase tracking-wide text-brand hover:underline"
                        >
                          {card.cta.text}
                          <ArrowRight
                            className="h-4 w-4 shrink-0"
                            strokeWidth={1.5}
                            aria-hidden
                          />
                        </a>
                      ) : (
                        <Link
                          href={card.cta.url}
                          className="inline-flex items-center gap-1 font-mono text-label uppercase tracking-wide text-brand hover:underline"
                        >
                          {card.cta.text}
                          <ArrowRight
                            className="h-4 w-4 shrink-0"
                            strokeWidth={1.5}
                            aria-hidden
                          />
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
