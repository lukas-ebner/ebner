'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import type { ImageConfig } from '@/lib/types'

interface ParallaxImageSlideProps {
  image: ImageConfig
  height?: string
  caption?: string
}

export function ParallaxImageSlide({
  image,
  height = '50vh',
  caption,
}: ParallaxImageSlideProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '-20%'])

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{ height }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-surface-light to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-surface-light to-transparent" />

      <motion.div
        className="absolute left-0 right-0 h-[130%] w-full"
        style={{ top: '-15%', y }}
      >
        <ImageWithFallback
          src={image.src}
          alt={image.alt ?? ''}
          fill
          className="object-cover object-center"
          sizes="100vw"
          label="Parallax"
        />
      </motion.div>

      {caption ? (
        <p className="absolute bottom-4 right-6 z-20 font-mono text-xs text-white/60">
          {caption}
        </p>
      ) : null}
    </div>
  )
}
