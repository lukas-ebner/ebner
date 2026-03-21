'use client'

import { motion } from 'framer-motion'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { Button } from '@/components/ui/Button'
import type { CtaConfig, ImageConfig } from '@/lib/types'

interface HeroSlideProps {
  headline: string
  subtext: string
  cta: CtaConfig
  image: ImageConfig
  align?: 'left' | 'center'
}

export function HeroSlide({
  headline,
  subtext,
  cta,
  image,
  align = 'center',
}: HeroSlideProps) {
  const opacity = image.opacity ?? 0.5
  const isLeft = align === 'left'

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-surface-dark">
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{ opacity }}>
          <ImageWithFallback
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            sizes="100vw"
            priority
            label="Hero-Bild"
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-dark via-surface-dark/60 to-transparent"
          aria-hidden
        />
      </div>

      <div
        className={`relative z-10 flex min-h-screen items-center px-6 pb-hero pt-28 sm:pt-32 ${
          isLeft ? 'justify-start' : 'justify-center text-center'
        }`}
      >
        <motion.div
          className={`max-w-3xl ${isLeft ? 'text-left' : 'mx-auto text-center'}`}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h1 className="font-display text-h1 font-normal text-text-light">{headline}</h1>
          <p
            className={`mt-6 font-body text-lg text-text-light/80 lg:text-xl ${isLeft ? 'max-w-xl' : 'mx-auto max-w-xl'}`}
          >
            {subtext}
          </p>
          <div className={`mt-10 ${isLeft ? '' : 'flex justify-center'}`}>
            <Button href={cta.url} variant="primary">
              {cta.text}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
