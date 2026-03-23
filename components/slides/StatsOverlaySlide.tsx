'use client'

import { motion, useInView } from 'framer-motion'
import { createElement, useRef } from 'react'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { useCountUp } from '@/lib/hooks/useCountUp'
import { formatStatDisplay, parseStatTarget } from '@/lib/stat-format'
import { getIcon } from '@/lib/icons'
import type { ImageConfig } from '@/lib/types'

interface StatItem {
  value: string
  label: string
  icon?: string
}

interface StatsOverlaySlideProps {
  headline?: string
  stats: StatItem[]
  image: ImageConfig
  source?: string
}

function shouldAnimateValue(raw: string): boolean {
  if (/Mio|€|stellig|\+/i.test(raw)) return false
  return parseStatTarget(raw) !== null
}

function OverlayStatCell({
  value,
  label,
  icon,
  index,
}: StatItem & { index: number }) {
  const ref = useRef(null)
  const enabled = useInView(ref, { once: true, margin: '-40px' })
  const target = parseStatTarget(value)
  const animate = shouldAnimateValue(value)
  const animated = useCountUp(
    target ?? 0,
    2000,
    enabled && animate && target !== null,
  )

  const display =
    animate && target !== null
      ? formatStatDisplay(value, animated)
      : value

  const IconComp = icon ? getIcon(icon) : null

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, ease: 'easeOut', delay: index * 0.08 }}
      className="min-w-[140px] flex-1"
    >
      {IconComp
        ? createElement(IconComp, {
            className: 'mb-2 h-6 w-6 text-text-light/60',
            strokeWidth: 1.5,
            'aria-hidden': true,
          })
        : null}
      <p className="font-display text-stat font-bold text-text-light">{display}</p>
      <p className="mt-2 font-mono text-pill uppercase tracking-widest text-text-light/60">
        {label}
      </p>
    </motion.div>
  )
}

export function StatsOverlaySlide({
  headline,
  stats,
  image,
  source,
}: StatsOverlaySlideProps) {
  const opacity = image.opacity ?? 0.5

  return (
    <div className="relative min-h-[60vh] w-full overflow-hidden bg-surface-dark">
      <div className="absolute inset-0">
        <ImageWithFallback
          src={image.src}
          alt={image.alt ?? ''}
          fill
          className="object-cover object-center"
          sizes="100vw"
          style={{ opacity }}
          label="Stats-Hintergrund"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-dark via-surface-dark/40 to-transparent"
          aria-hidden
        />
      </div>

      <div className="relative z-10 flex min-h-[60vh] flex-col justify-end px-8 pb-12 pt-24 lg:px-16 lg:pb-16">
        {headline ? (
          <h2 className="mb-8 font-display text-h2 font-normal text-text-light">{headline}</h2>
        ) : null}
        <div className="flex flex-wrap gap-8 lg:gap-16">
          {stats.map((stat, i) => (
            <OverlayStatCell key={`${stat.label}-${stat.value}`} {...stat} index={i} />
          ))}
        </div>
        {source ? (
          <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-text-light/40">
            {source}
          </p>
        ) : null}
      </div>
    </div>
  )
}
