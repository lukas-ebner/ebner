'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface TimelineEntry {
  period: string
  role: string
  org: string
  description?: string
  url?: string
  grade?: string
}

interface TimelineSlideProps {
  headline: string
  subtext?: string
  variant?: 'light' | 'dark'
  entries: TimelineEntry[]
}

function EntryCard({
  entry,
  index,
}: {
  entry: TimelineEntry
  index: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
      className="relative pl-8 pb-12 last:pb-0"
    >
      {/* timeline dot */}
      <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-brand bg-surface-light" />
      {/* timeline line */}
      <div className="absolute left-[5px] top-4 bottom-0 w-px bg-brand/20 last:hidden" />

      <span className="font-mono text-pill uppercase tracking-widest text-text-dimmed">
        {entry.period}
      </span>
      <h3 className="mt-1 font-display text-xl font-bold text-text-primary">
        {entry.role}
      </h3>
      {entry.url ? (
        <a
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 inline-block font-body text-sm font-medium text-brand hover:underline"
        >
          {entry.org} ↗
        </a>
      ) : (
        <p className="mt-0.5 font-body text-sm font-medium text-text-dimmed">
          {entry.org}
        </p>
      )}
      {entry.grade ? (
        <p className="mt-1 font-mono text-xs uppercase tracking-wider text-brand/80">
          Note: {entry.grade}
        </p>
      ) : null}
      {entry.description ? (
        <p className="mt-2 max-w-lg font-body text-body leading-relaxed text-text-dimmed">
          {entry.description}
        </p>
      ) : null}
    </motion.div>
  )
}

export function TimelineSlide({
  headline,
  subtext,
  variant = 'light',
  entries,
}: TimelineSlideProps) {
  const isDark = variant === 'dark'

  return (
    <div
      className={`py-section-mobile lg:py-section-desktop ${
        isDark ? 'bg-surface-dark' : 'bg-surface-light'
      }`}
    >
      <div className="mx-auto max-w-3xl px-8 lg:px-16">
        <h2
          className={`font-display text-h2 font-normal ${
            isDark ? 'text-text-light' : 'text-text-primary'
          }`}
        >
          {headline}
        </h2>
        {subtext ? (
          <p
            className={`mt-3 font-body text-body ${
              isDark ? 'text-text-light/60' : 'text-text-dimmed'
            }`}
          >
            {subtext}
          </p>
        ) : null}

        <div className="mt-12">
          {entries.map((entry, i) => (
            <EntryCard key={`${entry.org}-${entry.period}`} entry={entry} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
