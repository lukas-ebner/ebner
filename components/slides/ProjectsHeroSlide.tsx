'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import type { ImageConfig } from '@/lib/types'

interface ProjectTab {
  id: string
  label: string
  color: string
}

interface ProjectsHeroSlideProps {
  pill?: string
  headline: string
  subtext: string
  image?: ImageConfig
  projects?: ProjectTab[]
}

const DEFAULT_PROJECTS: ProjectTab[] = [
  { id: 'leadtime', label: 'Leadtime', color: '#F44900' },
  { id: 'fracto', label: 'Fracto', color: '#38BDF8' },
  { id: 'einsnull', label: '1&0', color: '#1E3A5F' },
  { id: 'kraftwerk', label: 'Kraftwerk', color: '#2D2D2D' },
]

export function ProjectsHeroSlide({
  pill = 'Projekte',
  headline,
  subtext,
  image,
  projects,
}: ProjectsHeroSlideProps) {
  const items = projects ?? DEFAULT_PROJECTS
  const [activeId, setActiveId] = useState<string | null>(null)

  // Observe which project section is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -60% 0px' }
    )

    items.forEach((p) => {
      const el = document.getElementById(p.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (el) {
      const offset = 140
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-surface-dark overflow-hidden">
      {/* Background image */}
      {image && (
        <div className="absolute inset-x-0 top-0 h-[55%] md:h-full md:bottom-0">
          <ImageWithFallback
            src={image.src}
            alt={image.alt || ''}
            fill
            className="object-cover object-[70%_30%] md:object-center"
            style={{ opacity: image.opacity ?? 0.25 }}
            sizes="100vw"
            priority
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface-dark to-transparent md:hidden" />
        </div>
      )}

      {/* Lighter gradient overlay — keeps text readable without killing the image */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(15,15,15,0.5) 0%, rgba(15,15,15,0.2) 40%, rgba(15,15,15,0.55) 100%)',
        }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center px-6 py-24 text-center lg:py-32"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {/* Pill */}
        <span
          className="mb-8 inline-block rounded-full px-5 py-2 font-mono text-pill font-normal uppercase tracking-widest text-white/90"
          style={{ backgroundColor: 'color-mix(in srgb, #F44900 30%, transparent)' }}
        >
          {pill}
        </span>

        {/* Headline */}
        <h1 className="font-display text-h1 font-normal text-text-light lg:text-stat">
          {headline}
        </h1>

        {/* Subtext */}
        <div className="mt-8 max-w-2xl space-y-4 font-body text-body leading-relaxed text-text-light/70">
          {subtext
            .split(/\n\n+/)
            .filter(Boolean)
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
        </div>

        {/* Project nav — prominent buttons with colored borders */}
        <div className="mt-14 flex flex-wrap justify-center gap-3">
          {items.map((p) => {
            const isActive = activeId === p.id
            return (
              <button
                key={p.id}
                onClick={() => scrollTo(p.id)}
                className="relative shrink-0 rounded-full px-7 py-3 font-mono text-label uppercase tracking-wider transition-all text-white/90 hover:text-white"
                style={{
                  border: `1.5px solid ${isActive ? p.color : `${p.color}60`}`,
                  backgroundColor: isActive ? `${p.color}30` : `${p.color}15`,
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="hero-project-tab"
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: `${p.color}20`, boxShadow: `0 0 20px ${p.color}30` }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2.5">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  {p.label}
                </span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Scroll indicator — bottom center, more visible */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
          Scroll
        </span>
        <motion.div
          className="h-10 w-px"
          style={{
            background: 'linear-gradient(to bottom, rgba(244,73,0,0.6), transparent)',
          }}
          animate={{ scaleY: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  )
}
