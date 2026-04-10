'use client'

import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'

interface TimelineEntry {
  period: string
  role: string
  org: string
  description?: string
  url?: string
  grade?: string
  image?: string
}

interface ParallaxImage {
  src: string
  alt?: string
  side?: 'left' | 'right'
}

interface TimelineSlideProps {
  headline: string
  subtext?: string
  variant?: 'light' | 'dark'
  entries: TimelineEntry[]
  parallaxImages?: ParallaxImage[]
}

function EntryCard({
  entry,
  index,
  isDark,
}: {
  entry: TimelineEntry
  index: number
  isDark: boolean
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.06 }}
      className="relative pl-10 pb-14 last:pb-0 isolate"
    >
      {/* Dot */}
      <div className={`absolute left-0 top-2 h-3.5 w-3.5 rounded-full border-2 border-brand ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`} />
      {/* Vertical line */}
      <div className="absolute left-[6px] top-5 bottom-0 w-px bg-brand/20" />

      {/* Period */}
      <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-dimmed">
        {entry.period}
      </span>

      {/* Role — bigger */}
      <h3 className={`mt-1.5 font-display text-[1.4rem] font-bold leading-tight lg:text-[1.65rem] ${isDark ? 'text-text-light' : 'text-text-primary'}`}>
        {entry.role}
      </h3>

      {/* Org */}
      {entry.url ? (
        <a href={entry.url} target="_blank" rel="noopener noreferrer"
          className="mt-1 inline-block font-body text-sm font-medium text-brand hover:underline">
          {entry.org} ↗
        </a>
      ) : (
        <p className={`mt-1 font-body text-sm font-medium ${isDark ? 'text-text-muted' : 'text-text-dimmed'}`}>{entry.org}</p>
      )}

      {/* Grade */}
      {entry.grade && (
        <p className="mt-1 font-mono text-xs uppercase tracking-wider text-brand/80">Note: {entry.grade}</p>
      )}

      {/* Description */}
      {entry.description && (
        <p className={`mt-2.5 max-w-xl font-body text-[0.95rem] leading-relaxed ${isDark ? 'text-text-muted' : 'text-text-dimmed'}`}>
          {entry.description}
        </p>
      )}
    </motion.div>
  )
}

/* Floating image that moves at a different scroll speed */
function FloatingImage({
  src,
  alt,
  side,
  topPercent,
  xOffset,
  scrollYProgress,
  speed,
}: {
  src: string
  alt: string
  side: 'left' | 'right'
  topPercent: number
  xOffset: number  // px from edge, varies per image
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress']
  speed: number
}) {
  // Very strong parallax – images drift significantly relative to content
  const y = useTransform(scrollYProgress, [0, 1], [speed * 1200, speed * -1200])

  // Position close to timeline: 420px from center + varied offset
  // Content is max-w-3xl (768px) = 384px from center, so 420px = ~36px gap
  const posStyle = side === 'left'
    ? { right: `calc(50% + ${400 + xOffset}px)` }
    : { left: `calc(50% + ${400 + xOffset}px)` }

  return (
    <motion.div
      style={{ y, top: `${topPercent}%`, ...posStyle }}
      className="absolute hidden xl:block w-[200px] 2xl:w-[240px] pointer-events-none"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-lg">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="240px"
        />
      </div>
    </motion.div>
  )
}

export function TimelineSlide({
  headline,
  subtext,
  variant = 'light',
  entries,
  parallaxImages,
}: TimelineSlideProps) {
  const isDark = variant === 'dark'
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // Use explicit side from content if present; otherwise alternate by index.
  const xOffsets = [20, 60, 10, 40, 30, 50]  // varied distances from edge
  const imagePositions = (parallaxImages || []).map((img, i) => ({
    ...img,
    side: img.side || ((i % 2 === 0 ? 'left' : 'right') as 'left' | 'right'),
    topPercent: 5 + i * (85 / Math.max((parallaxImages || []).length, 1)),
    xOffset: xOffsets[i % xOffsets.length],
    speed: 0.25 + (i % 3) * 0.12,  // varied speeds
  }))

  return (
    <div
      ref={sectionRef}
      className={`relative py-section-mobile lg:py-section-desktop overflow-hidden ${
        isDark ? 'bg-surface-dark' : 'bg-surface-light'
      }`}
    >
      {/* Parallax floating images — only on xl+ */}
      {imagePositions.map((img, i) => (
        <FloatingImage
          key={img.src}
          src={img.src}
          alt={img.alt || ''}
          side={img.side}
          topPercent={img.topPercent}
          xOffset={img.xOffset}
          scrollYProgress={scrollYProgress}
          speed={img.speed}
        />
      ))}

      <div className="relative z-20 mx-auto max-w-3xl px-8 lg:px-16">
        <h2
          className={`font-display text-h2 font-normal ${
            isDark ? 'text-text-light' : 'text-text-primary'
          }`}
        >
          {headline}
        </h2>
        {subtext && (
          <p className={`mt-3 font-body text-body ${isDark ? 'text-text-light/60' : 'text-text-dimmed'}`}>
            {subtext}
          </p>
        )}

        <div className="mt-14">
          {entries.map((entry, i) => (
            <EntryCard
              key={`${entry.org}-${entry.period}`}
              entry={entry}
              index={i}
              isDark={isDark}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
