'use client'

import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { useCountUp } from '@/lib/hooks/useCountUp'
import { formatStatDisplay, parseStatTarget } from '@/lib/stat-format'

interface StatItem {
  value: string
  label: string
}

interface StatsSlideProps {
  stats: StatItem[]
}

function StatCell({ value, label }: StatItem) {
  const ref = useRef(null)
  const enabled = useInView(ref, { once: true, margin: '-40px' })
  const target = parseStatTarget(value)
  const animated = useCountUp(target ?? 0, 2000, enabled && target !== null)

  const display =
    target !== null ? formatStatDisplay(value, animated) : value

  return (
    <div ref={ref} className="text-center">
      <p className="font-display text-stat font-bold text-text-light">{display}</p>
      <p className="mt-3 font-mono text-pill uppercase tracking-widest text-text-muted">
        {label}
      </p>
    </div>
  )
}

export function StatsSlide({ stats }: StatsSlideProps) {
  return (
    <div className="bg-surface-dark py-section-mobile lg:py-section-desktop">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCell key={`${stat.label}-${stat.value}`} {...stat} />
        ))}
      </div>
    </div>
  )
}
