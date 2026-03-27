'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { Button } from '@/components/ui/Button'
import { useCountUp } from '@/lib/hooks/useCountUp'
import { formatStatDisplay, parseStatTarget } from '@/lib/stat-format'
import type { CtaConfig, ImageConfig } from '@/lib/types'

interface StatItem {
  value: string
  label: string
  hideMobile?: boolean
}

function HeroStat({ value, label, hideMobile }: StatItem) {
  const ref = useRef(null)
  const enabled = useInView(ref, { once: true, margin: '-20px' })
  const target = parseStatTarget(value)
  const animated = useCountUp(target ?? 0, 2000, enabled && target !== null)
  const display = target !== null ? formatStatDisplay(value, animated) : value

  return (
    <div ref={ref} className={`text-center ${hideMobile ? 'hidden md:block' : ''}`}>
      <p className="font-display text-[2rem] font-bold text-text-light md:text-[2.5rem] lg:text-[3rem]">
        {display}
      </p>
      <p className="mt-1 font-mono text-[0.75rem] uppercase tracking-widest text-text-light/50 md:text-[0.8rem]">
        {label}
      </p>
    </div>
  )
}

interface HeroSlideProps {
  headline: string
  subtext: string
  cta: CtaConfig
  image: ImageConfig
  align?: 'left' | 'center'
  stats?: StatItem[]
}

export function HeroSlide({
  headline,
  subtext,
  cta,
  image,
  align = 'center',
  stats,
}: HeroSlideProps) {
  const opacity = image.opacity ?? 0.5
  const isLeft = align === 'left'

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-surface-dark">
      <div className="absolute inset-0">
        <ImageWithFallback
          src={image.src}
          alt={image.alt ?? ''}
          fill
          className="object-cover object-[30%_30%] lg:object-center"
          sizes="100vw"
          priority
          style={{ opacity }}
          label="Hero-Bild"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-dark/80 via-transparent to-transparent"
          aria-hidden
        />
      </div>

      <div
        className={`relative z-10 flex min-h-screen flex-col px-8 pt-28 sm:pt-32 lg:px-12 ${
          isLeft ? 'justify-start' : 'justify-center text-center'
        }`}
      >
        {/* Content */}
        <div className={`flex flex-1 items-center pb-0 lg:items-center lg:pb-0 ${isLeft ? 'justify-start' : 'justify-center'}`}>
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

        {/* Stats Bar – am unteren Rand */}
        {stats && stats.length > 0 && (
          <motion.div
            className="w-full border-t border-white/10 pb-10 pt-8 lg:pb-12 lg:pt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
          >
            <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 lg:grid-cols-5 lg:gap-8">
              {stats.map((stat) => (
                <HeroStat key={`${stat.label}-${stat.value}`} {...stat} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
