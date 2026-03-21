'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'

interface StatementSlideProps {
  headline: string
  variant?: 'dark' | 'orange'
  backgroundImage?: { src: string; alt: string }
}

export function StatementSlide({
  headline,
  variant = 'dark',
  backgroundImage,
}: StatementSlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const bg =
    variant === 'orange'
      ? 'bg-brand text-white'
      : 'bg-surface-dark text-text-light'
  const headlineClass =
    variant === 'orange' ? 'text-white' : 'text-text-light'

  return (
    <div ref={ref} className={`relative overflow-hidden py-section-mobile lg:py-section-desktop ${bg}`}>
      {backgroundImage ? (
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <ImageWithFallback
            src={backgroundImage.src}
            alt={backgroundImage.alt}
            fill
            className="object-cover"
            sizes="100vw"
            label="Hintergrund"
          />
        </div>
      ) : null}
      <motion.div
        className="relative z-10 mx-auto max-w-[900px] px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <h2 className={`text-center font-display text-h1 font-bold ${headlineClass}`}>
          {headline}
        </h2>
      </motion.div>
    </div>
  )
}
