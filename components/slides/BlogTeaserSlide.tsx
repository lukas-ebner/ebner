'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { Button } from '@/components/ui/Button'

interface BlogTeaserSlideProps {
  headline?: string
  post: {
    title: string
    excerpt: string
    date?: string
    image?: string
    url: string
    category?: string
  }
  variant?: 'light' | 'dark'
  bg?: string
  direction?: 'left' | 'right'
}

export function BlogTeaserSlide({
  headline = 'Aus dem Blog',
  post,
  variant = 'light',
  bg,
  direction = 'right',
}: BlogTeaserSlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const useLightText = bg
    ? (() => {
        const h = bg.replace('#', '')
        if (h.length < 6) return false
        const r = parseInt(h.slice(0, 2), 16)
        const g = parseInt(h.slice(2, 4), 16)
        const b = parseInt(h.slice(4, 6), 16)
        return (r * 299 + g * 587 + b * 114) / 1000 < 150
      })()
    : variant === 'dark'

  const bgClass = bg
    ? ''
    : variant === 'dark'
      ? 'bg-surface-dark'
      : 'bg-white'

  const imageOnRight = direction === 'right'

  return (
    <div
      ref={ref}
      className={`${bgClass} relative min-h-screen overflow-hidden`}
      style={bg ? { backgroundColor: bg } : undefined}
    >
      {/* ── Image: absolute, full height, flush to edge ── */}
      {post.image && (
        <motion.div
          className={`hidden lg:block absolute top-0 bottom-0 w-[48%] ${
            imageOnRight ? 'right-0' : 'left-0'
          }`}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <ImageWithFallback
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            sizes="50vw"
            label={post.title}
          />
        </motion.div>
      )}

      {/* ── Content layer ── */}
      <div className="relative z-10 flex min-h-screen flex-col justify-center py-section-mobile lg:py-section-desktop">
        <div className="mx-auto w-full max-w-[1800px] px-8 lg:px-16">
          <motion.div
            className={`${post.image ? (imageOnRight ? 'lg:w-[48%] lg:pr-12' : 'lg:w-[48%] lg:ml-auto lg:pl-12') : 'max-w-[780px]'}`}
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Pill + Category */}
            <div className="mb-6 flex items-center gap-3">
              <div
                className="inline-block rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-widest"
                style={{
                  borderColor: useLightText ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)',
                  color: useLightText ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.4)',
                }}
              >
                {headline}
              </div>
              {post.category && (
                <span
                  className="font-mono text-[11px] uppercase tracking-wider"
                  style={{ color: useLightText ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)' }}
                >
                  — {post.category}
                </span>
              )}
            </div>

            {/* Title */}
            <h2
              className={`max-w-[700px] font-display text-[2rem] font-normal leading-[1.1] md:text-[2.8rem] lg:text-[3.2rem] ${
                useLightText ? 'text-white' : 'text-text-primary'
              }`}
            >
              {post.title}
            </h2>

            {/* Excerpt */}
            <div className="mt-6 max-w-[620px] space-y-4">
              <p
                className={`font-body text-lg leading-relaxed ${
                  useLightText ? 'text-white/70' : 'text-text-secondary'
                }`}
              >
                {post.excerpt}
              </p>
            </div>

            {/* Date */}
            {post.date && (
              <p
                className={`mt-4 font-mono text-xs ${
                  useLightText ? 'text-white/30' : 'text-text-dimmed/60'
                }`}
              >
                {post.date}
              </p>
            )}

            {/* CTA */}
            <div className="mt-10">
              <Button
                href={post.url}
                variant="outline"
                className={useLightText ? '!border-white/30 !text-white hover:!bg-white/10' : ''}
              >
                Weiterlesen
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Mobile image (below text) ── */}
      {post.image && (
        <motion.div
          className="relative lg:hidden aspect-[4/3] w-full"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7 }}
        >
          <ImageWithFallback
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            sizes="100vw"
            label={post.title}
          />
        </motion.div>
      )}
    </div>
  )
}
