'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface Project {
  id: string
  label: string
  color: string
}

interface ProjectNavSlideProps {
  projects?: Project[]
}

const DEFAULT_PROJECTS: Project[] = [
  { id: 'leadtime', label: 'Leadtime', color: '#F44900' },
  { id: 'fracto', label: 'Fracto', color: '#38BDF8' },
  { id: 'einsnull', label: '1&0', color: '#1E3A5F' },
  { id: 'kraftwerk', label: 'Kraftwerk', color: '#2D2D2D' },
]

export function ProjectNavSlide({ projects }: ProjectNavSlideProps) {
  const items = projects ?? DEFAULT_PROJECTS
  const [activeId, setActiveId] = useState<string | null>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const [isSticky, setIsSticky] = useState(false)

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

  useEffect(() => {
    if (!navRef.current) return
    const sentinel = navRef.current

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting)
      },
      { threshold: 1, rootMargin: '-81px 0px 0px 0px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (el) {
      const offset = 140
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <div ref={navRef} className="sticky top-20 z-30">
      <div
        className={`border-b transition-all duration-300 ${
          isSticky
            ? 'border-white/10 bg-surface-dark/95 backdrop-blur-md shadow-lg'
            : 'border-white/5 bg-surface-dark'
        }`}
      >
        <div className="mx-auto flex max-w-[1600px] items-center gap-1 overflow-x-auto px-8 py-3 lg:px-20">
          {items.map((p) => {
            const isActive = activeId === p.id
            return (
              <button
                key={p.id}
                onClick={() => scrollTo(p.id)}
                className={`relative shrink-0 rounded-full px-5 py-2 font-mono text-xs uppercase tracking-wider transition-all ${
                  isActive
                    ? 'text-white'
                    : 'text-text-light/40 hover:text-text-light/70'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="project-tab"
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: `${p.color}30` }}
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
      </div>
    </div>
  )
}
