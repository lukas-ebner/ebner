'use client'

import { motion } from 'framer-motion'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { Button } from '@/components/ui/Button'
import type { CtaConfig, ImageConfig } from '@/lib/types'

interface HeroSplitSlideProps {
  headline: string
  subtext: string
  cta: CtaConfig
  image?: ImageConfig
  video?: string
  pill?: string
}

export function HeroSplitSlide({
  headline,
  subtext,
  cta,
  image,
  video,
  pill,
}: HeroSplitSlideProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 items-stretch bg-surface-dark lg:grid-cols-2">
      <motion.div
        className="order-2 flex flex-col justify-center px-8 py-12 lg:order-none lg:px-12 lg:py-24 lg:pt-24"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {pill ? (
          <span
            className="mb-4 inline-block w-fit rounded-full px-3 py-1 font-mono text-xs font-normal uppercase tracking-widest text-white/90"
            style={{ backgroundColor: 'color-mix(in srgb, #F44900 30%, transparent)' }}
          >
            {pill}
          </span>
        ) : null}
        <h1 className="font-display text-h2 font-normal text-text-light lg:text-h1">
          {headline}
        </h1>
        <p className="mt-6 max-w-lg font-body text-lg leading-relaxed text-text-light/70">
          {subtext}
        </p>
        <div className="mt-10">
          <Button href={cta.url} variant="primary">
            {cta.text}
          </Button>
        </div>
      </motion.div>

      <div className="relative order-1 h-[50vh] w-full overflow-hidden lg:order-none lg:h-full lg:min-h-screen">
        {video ? (
          <video
            src={video}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : image ? (
          <ImageWithFallback
            src={image.src}
            alt={image.alt ?? ''}
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            label="Hero-Bild"
          />
        ) : null}
      </div>
    </div>
  )
}
