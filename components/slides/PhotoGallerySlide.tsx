'use client'

import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState, useCallback, useEffect } from 'react'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import Image from 'next/image'
import type { ImageConfig } from '@/lib/types'

interface PhotoGallerySlideProps {
  headline?: string
  subtext?: string
  photos?: ImageConfig[]
  variant?: 'light' | 'dark'
  lightbox?: boolean
  bg?: string
  /** Fetch random photos from /api/random-photos */
  randomDir?: string
  /** Number of photos when using randomDir */
  randomCount?: number
}

/**
 * Bento grid layout patterns for 8 photos.
 * Each item has a grid span (colSpan, rowSpan) and aspect ratio hint.
 * Pattern creates visual variety with 2 large + 6 regular tiles.
 */
const BENTO_PATTERNS = [
  // Pattern A: large top-left, large bottom-right
  [
    { col: 'col-span-2', row: 'row-span-2', aspect: 'aspect-square' },
    { col: 'col-span-1', row: 'row-span-1', aspect: 'aspect-[4/3]' },
    { col: 'col-span-1', row: 'row-span-1', aspect: 'aspect-[4/3]' },
    { col: 'col-span-1', row: 'row-span-1', aspect: 'aspect-[4/3]' },
    { col: 'col-span-1', row: 'row-span-1', aspect: 'aspect-[4/3]' },
    { col: 'col-span-1', row: 'row-span-1', aspect: 'aspect-[4/3]' },
    { col: 'col-span-2', row: 'row-span-2', aspect: 'aspect-[16/10]' },
    { col: 'col-span-1', row: 'row-span-1', aspect: 'aspect-[4/3]' },
  ],
  // Pattern B: large top-right, large bottom-left
  [
    { col: 'col-span-1', row: 'row-span-1', aspect: 'aspect-[4/3]' },
    { col: 'col-span-1', row: 'row-span-1', aspect: 'aspect-[4/3]' },
    { col: 'col-span-2', row: 'row-span-2', aspect: 'aspect-square' },
    { col: 'col-span-1', row: 'row-span-1', aspect: 'aspect-[4/3]' },
    { col: 'col-span-1', row: 'row-span-1', aspect: 'aspect-[4/3]' },
    { col: 'col-span-2', row: 'row-span-2', aspect: 'aspect-[16/10]' },
    { col: 'col-span-1', row: 'row-span-1', aspect: 'aspect-[4/3]' },
    { col: 'col-span-1', row: 'row-span-1', aspect: 'aspect-[4/3]' },
  ],
]

export function PhotoGallerySlide({
  headline,
  subtext,
  photos: staticPhotos,
  variant = 'light',
  lightbox = true,
  bg,
  randomDir,
  randomCount = 8,
}: PhotoGallerySlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const isDark = variant === 'dark'
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [photos, setPhotos] = useState<ImageConfig[]>(staticPhotos || [])
  const [patternIndex] = useState(() => Math.floor(Math.random() * BENTO_PATTERNS.length))

  // Fetch random photos if randomDir is set
  useEffect(() => {
    if (!randomDir) return
    fetch(`/api/random-photos?count=${randomCount}`)
      .then((r) => r.json())
      .then((data: ImageConfig[]) => {
        if (data.length > 0) setPhotos(data)
      })
      .catch(() => {})
  }, [randomDir, randomCount])

  const openLightbox = useCallback(
    (i: number) => {
      if (lightbox) setLightboxIndex(i)
    },
    [lightbox]
  )

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])

  const navigate = useCallback(
    (dir: 1 | -1) => {
      setLightboxIndex((prev) => {
        if (prev === null) return null
        const next = prev + dir
        if (next < 0) return photos.length - 1
        if (next >= photos.length) return 0
        return next
      })
    },
    [photos.length]
  )

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') navigate(1)
      if (e.key === 'ArrowLeft') navigate(-1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIndex, closeLightbox, navigate])

  const pattern = BENTO_PATTERNS[patternIndex]

  return (
    <>
      <div
        ref={ref}
        className={`py-section-mobile lg:py-section-desktop ${
          bg ? '' : isDark ? 'bg-surface-dark' : 'bg-surface-light'
        }`}
        style={bg ? { backgroundColor: bg } : undefined}
      >
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          {headline && (
            <h2
              className={`font-display text-h2 font-normal ${
                isDark ? 'text-text-light' : 'text-text-primary'
              }`}
            >
              {headline}
            </h2>
          )}
          {subtext && (
            <p
              className={`mt-4 max-w-2xl font-body text-body leading-relaxed ${
                isDark ? 'text-text-light/60' : 'text-text-dimmed'
              }`}
            >
              {subtext}
            </p>
          )}

          {/* Bento Grid */}
          <div
            className={`${headline || subtext ? 'mt-10' : ''} grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[200px] gap-3`}
          >
            {photos.map((photo, i) => {
              const layout = pattern[i % pattern.length]
              return (
                <motion.div
                  key={`${photo.src}-${i}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{
                    duration: 0.5,
                    ease: 'easeOut',
                    delay: i * 0.06,
                  }}
                  className={`relative overflow-hidden rounded-xl ${layout.col} ${layout.row} ${
                    lightbox ? 'cursor-pointer' : ''
                  } group`}
                  onClick={() => openLightbox(i)}
                >
                  <ImageWithFallback
                    src={photo.src}
                    alt={photo.alt ?? ''}
                    fill
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    label="Foto"
                  />
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Lightbox overlay */}
      <AnimatePresence>
        {lightbox && lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 z-10 text-white/70 hover:text-white transition-colors"
              aria-label="Schließen"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Nav arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                navigate(-1)
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              aria-label="Vorheriges Bild"
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="15,18 9,12 15,6" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                navigate(1)
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              aria-label="Nächstes Bild"
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9,18 15,12 9,6" />
              </svg>
            </button>

            {/* Image */}
            <div
              className="relative max-h-[85vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={photos[lightboxIndex].src}
                alt={photos[lightboxIndex].alt ?? ''}
                width={1200}
                height={800}
                className="max-h-[85vh] w-auto rounded-lg object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
