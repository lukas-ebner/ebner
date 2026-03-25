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
    <div className="relative grid min-h-screen grid-cols-1 items-stretch bg-surface-dark lg:grid-cols-2">
      {/* Text side */}
      <motion.div
        className="order-2 flex flex-col justify-center px-8 py-12 lg:order-none lg:px-12 lg:py-24"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <span
          className="mb-4 inline-block w-fit rounded-full px-3 py-1 font-mono text-xs font-normal uppercase tracking-widest text-white/90"
          style={{ backgroundColor: 'color-mix(in srgb, #F44900 30%, transparent)' }}
        >
          Projekte
        </span>

        <h1 className="font-display text-h2 font-normal text-text-light lg:text-h1">
          {headline}
        </h1>
        <p className="mt-6 max-w-lg font-body text-lg leading-relaxed text-text-light/70">
          {subtext}
        </p>

        {/* Project nav – replaces CTA */}
        <div className="mt-10 flex flex-wrap gap-2">
          {items.map((p) => {
            const isActive = activeId === p.id
            return (
              <button
                key={p.id}
                onClick={() => scrollTo(p.id)}
                className={`relative shrink-0 rounded-full px-5 py-2.5 font-mono text-xs uppercase tracking-wider transition-all ${
                  isActive
                    ? 'text-white'
                    : 'text-text-light/40 hover:text-text-light/70'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="hero-project-tab"
                    className="absolute inset-0 rounded-full border border-white/20"
                    style={{ backgroundColor: `${p.color}25` }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  {p.label}
                </span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Image side */}
      <div className="relative order-1 min-h-[300px] lg:order-none lg:min-h-0">
        {image && (
          <ImageWithFallback
            src={image.src}
            alt={image.alt || ''}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        )}
      </div>
    </div>
  )
}
