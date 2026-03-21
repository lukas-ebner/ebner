'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'

interface StatementSlideProps {
  headline: string
  /** `orange`: dunkler Hintergrund + orange Akzentlinie (kein Vollflächen-Orange) */
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
  const showAccentLine = variant === 'orange'

  return (
    <div
      ref={ref}
      className="relative overflow-hidden bg-surface-dark py-section-mobile lg:py-section-desktop text-text-light"
    >
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
        {showAccentLine ? (
          <div className="mx-auto mb-8 h-[2px] w-16 bg-brand" aria-hidden />
        ) : null}
        <h2 className="text-center font-display text-h1 font-normal leading-tight text-text-light">
          {headline}
        </h2>
      </motion.div>
    </div>
  )
}
