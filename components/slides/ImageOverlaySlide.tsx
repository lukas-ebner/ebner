'use client'

import { motion } from 'framer-motion'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { Button } from '@/components/ui/Button'
import type { CtaConfig, ImageConfig } from '@/lib/types'

interface ImageOverlaySlideProps {
  headline: string
  body?: string
  image: ImageConfig
  align?: 'left' | 'center' | 'right'
  valign?: 'bottom' | 'center'
  height?: string
  cta?: CtaConfig
  gradient?: 'bottom' | 'left' | 'right' | 'full'
  variant?: 'dark' | 'teal'
  pill?: string
}

function bodyParagraphs(body?: string): string[] {
  if (!body) return []
  return body.split(/\n\n+/).filter((p) => p.trim().length > 0).map((p) => p.trim())
}

export function ImageOverlaySlide({
  headline,
  body,
  image,
  align = 'left',
  valign = 'bottom',
  height = '70vh',
  cta,
  gradient = 'bottom',
  variant = 'dark',
  pill,
}: ImageOverlaySlideProps) {
  const opacity = image.opacity ?? 0.4
  const isTeal = variant === 'teal'
  const fromBottom = isTeal ? 'from-teal/90 via-teal/50' : 'from-surface-dark/90 via-surface-dark/50'
  const fromSide = isTeal ? 'from-teal/80 via-teal/20' : 'from-black/80 via-black/35'

  const gradientOverlay =
    gradient === 'bottom' ? (
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-t ${fromBottom} to-transparent`} aria-hidden />
    ) : gradient === 'left' ? (
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${fromSide} to-transparent`} aria-hidden />
    ) : gradient === 'right' ? (
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-l ${fromSide} to-transparent`} aria-hidden />
    ) : (
      <div className={`pointer-events-none absolute inset-0 ${isTeal ? 'bg-teal/60' : 'bg-surface-dark/60'}`} aria-hidden />
    )

  const paragraphs = bodyParagraphs(body)

  const alignClasses =
    align === 'center'
      ? 'items-center text-center'
      : align === 'right'
        ? 'items-end text-left lg:items-end'
        : 'items-start text-left'

  const valignClass = valign === 'center' ? 'justify-center' : 'justify-end'

  const contentMaxW =
    align === 'center' ? 'mx-auto max-w-3xl' : align === 'right' ? 'max-w-xl lg:max-w-lg' : 'max-w-3xl'

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ minHeight: height }}
    >
      <div className="absolute inset-0">
        <ImageWithFallback
          src={image.src}
          alt={image.alt ?? ''}
          fill
          className={`object-cover ${image.position ? `object-[${image.position}]` : 'object-center'}`}
          sizes="100vw"
          style={{ opacity }}
          label="Hintergrund"
        />
        {gradientOverlay}
      </div>

      <div
        className={`relative z-10 flex min-h-[inherit] flex-col ${valignClass} px-8 py-16 lg:px-16 lg:py-24 ${alignClasses}`}
        style={{ minHeight: height }}
      >
        <div className={contentMaxW}>
          {pill ? (
            <motion.span
              className="mb-4 inline-block rounded-full border border-text-light/20 px-3 py-1 font-mono text-xs uppercase tracking-widest text-text-light/60"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {pill}
            </motion.span>
          ) : null}
          <motion.h2
            className="font-display text-h1 font-normal text-text-light"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {headline}
          </motion.h2>
          {paragraphs.length > 0 ? (
            <motion.div
              className={`mt-6 space-y-4 ${align === 'center' ? 'mx-auto max-w-2xl' : 'max-w-xl'}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
            >
              {paragraphs.map((p, i) => (
                <p key={i} className="font-body text-lg leading-relaxed text-text-light/80">
                  {p}
                </p>
              ))}
            </motion.div>
          ) : null}
          {cta ? (
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            >
              <Button href={cta.url} variant="primary">
                {cta.text}
              </Button>
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
