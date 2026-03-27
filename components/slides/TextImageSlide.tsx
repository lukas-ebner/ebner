'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import type { ImageConfig } from '@/lib/types'

interface TextImageSlideProps {
  headline: string
  body: string
  image?: ImageConfig
  pill?: string
  variant?: 'light' | 'dark'
  /** Image position: right (default) or left */
  imagePosition?: 'left' | 'right'
  /** Render image as a cutout (PNG freisteller) — no bg, bottom-aligned, with drop shadow */
  freisteller?: boolean
  /** Reduce vertical padding between blocks */
  compact?: boolean
}

function bodyParagraphs(body: string): string[] {
  return body
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 0)
    .map((p) => p.trim())
}

export function TextImageSlide({
  headline,
  body,
  image,
  pill,
  variant = 'light',
  imagePosition = 'right',
  freisteller = false,
  compact = false,
}: TextImageSlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const isDark = variant === 'dark'
  const paragraphs = bodyParagraphs(body)

  const textBlock = (
    <div className={`flex flex-col justify-center ${freisteller ? 'pb-10 lg:pb-14' : ''}`}>
      {pill && (
        <p
          className={`mb-4 font-mono text-label uppercase tracking-widest ${
            isDark ? 'text-brand' : 'text-brand'
          }`}
        >
          {pill}
        </p>
      )}
      <h2
        className={`font-display text-h2 font-normal leading-tight lg:text-h1 ${
          isDark ? 'text-text-light' : 'text-text-primary'
        }`}
      >
        {headline}
      </h2>
      <div className="mt-6 space-y-4">
        {paragraphs.map((p, i) => (
          <p
            key={i}
            className={`font-body text-lg leading-relaxed ${
              isDark ? 'text-text-light/80' : 'text-text-secondary'
            }`}
          >
            {p}
          </p>
        ))}
      </div>
    </div>
  )

  const imageBlock = image ? (
    freisteller ? (
      /* Freisteller: PNG cutout, bottom-right, flush with block edge */
      <div className="relative flex items-end justify-end self-end" style={{ marginBottom: '0', marginRight: '-20px' }}>
        <img
          src={image.src}
          alt={image.alt ?? ''}
          className="relative h-auto max-h-[50vh] w-auto max-w-full object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
        />
      </div>
    ) : (
      <div className="relative aspect-[16/9] w-full overflow-hidden shadow-md">
        <ImageWithFallback
          src={image.src}
          alt={image.alt ?? ''}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 45vw"
          label="Slide-Bild"
        />
      </div>
    )
  ) : null

  return (
    <div
      ref={ref}
      className={isDark ? 'bg-surface-dark' : 'bg-white'}
    >
      <motion.div
        className={`mx-auto grid max-w-[1600px] grid-cols-1 items-end px-8 lg:grid-cols-[1fr_1fr] lg:px-20 ${
          freisteller ? 'gap-6 lg:gap-10' : 'gap-12 lg:gap-20'
        } ${
          compact ? 'pt-12 pb-0 lg:pt-16 lg:pb-0' : 'py-24 lg:py-32'
        }`}
        initial={{ opacity: 0, y: 32 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {imagePosition === 'left' ? (
          <>
            {imageBlock}
            {textBlock}
          </>
        ) : (
          <>
            {textBlock}
            {imageBlock}
          </>
        )}
      </motion.div>
    </div>
  )
}
