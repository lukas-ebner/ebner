'use client'

import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { Button } from '@/components/ui/Button'
import type { CtaConfig, ImageConfig } from '@/lib/types'

interface CTASlideProps {
  headline: string
  subtext: string
  cta: CtaConfig
  image: ImageConfig
}

export function CTASlide({ headline, subtext, cta, image }: CTASlideProps) {
  const opacity = image.opacity ?? 0.4

  return (
    <div className="relative min-h-[70vh] w-full overflow-hidden bg-surface-dark">
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{ opacity }}>
          <ImageWithFallback
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            sizes="100vw"
            label="CTA-Hintergrund"
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-dark via-surface-dark/70 to-surface-dark/40"
          aria-hidden
        />
      </div>

      <div className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center px-6 pb-section-desktop pt-28 text-center sm:pt-32">
        <h2 className="font-display text-h2 font-normal text-text-light">{headline}</h2>
        <p className="mt-4 max-w-xl font-body text-body text-text-light/70">{subtext}</p>
        <div className="mt-10">
          <Button href={cta.url} variant="primary">
            {cta.text}
          </Button>
        </div>
      </div>
    </div>
  )
}
