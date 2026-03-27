'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { InlineMarkdown } from '@/components/ui/InlineMarkdown'
import type { ImageConfig } from '@/lib/types'

interface Feature {
  headline: string
  body: string
  image: ImageConfig
}

interface NumberedFeaturesSlideProps {
  headline: string
  body?: string
  features: Feature[]
}

function bodyParagraphs(body: string): string[] {
  return body
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 0)
    .map((p) => p.trim())
}

export function NumberedFeaturesSlide({
  headline,
  body,
  features,
}: NumberedFeaturesSlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const introParagraphs = body ? bodyParagraphs(body) : []

  return (
    <div ref={ref} className="bg-white">
      {/* ── Headline + Intro ── */}
      <motion.div
        className="mx-auto max-w-[1600px] px-8 pt-32 lg:px-20 lg:pt-48"
        initial={{ opacity: 0, y: 32 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h2 className="max-w-[720px] font-display text-[2.5rem] font-normal leading-[1.1] text-text-primary md:text-[3.5rem] lg:text-[4.25rem]">
          {headline}
        </h2>
        {introParagraphs.length > 0 && (
          <div className="mt-8 max-w-[640px] space-y-4">
            {introParagraphs.map((p, i) => (
              <p
                key={i}
                className="font-body text-lg leading-relaxed text-text-secondary lg:text-xl"
              >
                <InlineMarkdown text={p} />
              </p>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Features ── */}
      <div className="mx-auto max-w-[1600px] px-8 pb-32 pt-24 lg:px-20 lg:pb-48 lg:pt-40">
        {features.map((feature, i) => (
          <FeatureBlock key={i} feature={feature} index={i} />
        ))}
      </div>
    </div>
  )
}

function FeatureBlock({
  feature,
  index,
}: {
  feature: Feature
  index: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const paragraphs = bodyParagraphs(feature.body)
  const number = String(index + 1).padStart(2, '0')

  return (
    <motion.div
      ref={ref}
      className="mb-24 grid grid-cols-1 items-center gap-[60px] last:mb-0 lg:mb-32 lg:grid-cols-2"
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
    >
      {/* Text – always left */}
      <div className="flex flex-col justify-center py-8 lg:py-0">
        <span className="mb-2 font-display text-[2.5rem] font-normal leading-none text-text-primary/15 lg:text-[3rem]">
          {number}
        </span>
        <h3 className="font-display text-[1.75rem] font-normal leading-[1.15] text-text-primary md:text-[2.25rem] lg:text-[2.75rem]">
          {feature.headline}
        </h3>
        <div className="mt-4 space-y-3">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="font-body text-base leading-relaxed text-text-secondary lg:text-lg"
            >
              <InlineMarkdown text={p} />
            </p>
          ))}
        </div>
      </div>

      {/* Image – always right */}
      <div className="relative aspect-video w-full overflow-hidden rounded-sm shadow-lg">
        <ImageWithFallback
          src={feature.image.src}
          alt={feature.image.alt ?? ''}
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 720px"
          label={`Feature ${index + 1}`}
        />
      </div>
    </motion.div>
  )
}
