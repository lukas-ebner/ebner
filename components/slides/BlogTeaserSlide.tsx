'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'

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
}

export function BlogTeaserSlide({
  headline = 'Aus dem Blog',
  post,
  variant = 'light',
  bg,
}: BlogTeaserSlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const isDark = variant === 'dark'

  const bgClass = bg
    ? ''
    : isDark
      ? 'bg-surface-dark'
      : 'bg-white'

  return (
    <div
      ref={ref}
      className={`py-section-mobile lg:py-section-desktop ${bgClass}`}
      style={bg ? { backgroundColor: bg } : undefined}
    >
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Section label */}
          <span className={`font-mono text-[11px] uppercase tracking-[0.2em] ${isDark ? 'text-text-light/40' : 'text-text-dimmed'}`}>
            {headline}
          </span>

          {/* Card */}
          <a
            href={post.url}
            className={`mt-4 block group rounded-2xl overflow-hidden border transition-shadow hover:shadow-xl ${
              isDark ? 'border-white/10 bg-white/5' : 'border-border bg-surface-light'
            }`}
          >
            <div className="grid md:grid-cols-5 gap-0">
              {/* Image */}
              {post.image && (
                <div className="relative md:col-span-2 aspect-[16/10] md:aspect-auto">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                </div>
              )}

              {/* Content */}
              <div className={`${post.image ? 'md:col-span-3' : 'md:col-span-5'} flex flex-col justify-center p-6 lg:p-10`}>
                {post.category && (
                  <span className="mb-2 inline-block self-start rounded-full bg-brand/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-brand">
                    {post.category}
                  </span>
                )}
                <h3 className={`font-display text-[1.5rem] lg:text-[1.8rem] font-bold leading-tight ${
                  isDark ? 'text-text-light' : 'text-text-primary'
                }`}>
                  {post.title}
                </h3>
                <p className={`mt-3 font-body text-[0.95rem] leading-relaxed line-clamp-3 ${
                  isDark ? 'text-text-light/60' : 'text-text-dimmed'
                }`}>
                  {post.excerpt}
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="font-body text-sm font-medium text-brand group-hover:underline">
                    Weiterlesen →
                  </span>
                  {post.date && (
                    <span className={`font-mono text-xs ${isDark ? 'text-text-light/30' : 'text-text-dimmed/60'}`}>
                      {post.date}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </a>
        </motion.div>
      </div>
    </div>
  )
}
