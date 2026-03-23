'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import type { ImageConfig } from '@/lib/types'

interface PhotoGallerySlideProps {
  headline?: string
  photos: ImageConfig[]
  variant?: 'light' | 'dark'
}

export function PhotoGallerySlide({
  headline,
  photos,
  variant = 'light',
}: PhotoGallerySlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const isDark = variant === 'dark'

  return (
    <div
      ref={ref}
      className={`py-section-mobile lg:py-section-desktop ${
        isDark ? 'bg-surface-dark' : 'bg-surface-light'
      }`}
    >
      {headline ? (
        <h2
          className={`mb-10 text-center font-display text-h2 font-normal ${
            isDark ? 'text-text-light' : 'text-text-primary'
          }`}
        >
          {headline}
        </h2>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        {/* Masonry-like grid with varying heights */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {photos.map((photo, i) => {
            // Alternate tall and short rows for visual interest
            const isTall = i % 5 === 0 || i % 5 === 3
            return (
              <motion.div
                key={photo.src}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{
                  duration: 0.5,
                  ease: 'easeOut',
                  delay: i * 0.06,
                }}
                className={`relative overflow-hidden rounded-lg ${
                  isTall
                    ? 'row-span-2 aspect-[3/4]'
                    : 'aspect-square'
                }`}
              >
                <ImageWithFallback
                  src={photo.src}
                  alt={photo.alt ?? ''}
                  fill
                  className="object-cover object-center transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  label="Galerie-Foto"
                />
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
