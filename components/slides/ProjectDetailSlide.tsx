'use client'

import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface DetailBlock {
  label: string
  text: string
}

interface ProjectDetailSlideProps {
  color: string
  logo?: string
  headline: string
  body: string
  details?: DetailBlock[]
  stats?: { value: string; label: string }[]
  screenshot?: { src: string; alt: string }
  slideshow?: { src: string; alt?: string }[]
  video?: { src: string }
  link?: { url: string; label: string }
  context?: string
  dark?: boolean
}

function bodyParagraphs(body: string): string[] {
  return body
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 0)
    .map((p) => p.trim())
}

export function ProjectDetailSlide({
  color,
  logo,
  headline,
  body,
  details,
  stats,
  screenshot,
  slideshow,
  video,
  link,
  context,
  dark = false,
}: ProjectDetailSlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const paragraphs = bodyParagraphs(body)

  const bg = dark ? 'bg-black' : 'bg-white'
  const textPrimary = dark ? 'text-white' : 'text-text-primary'
  const textSecondary = dark ? 'text-white/70' : 'text-text-secondary'
  const textMuted = dark ? 'text-white/50' : 'text-text-muted'
  const contextBg = dark ? `${color}20` : `${color}08`

  /* ── Slideshow auto-advance ── */
  const [activeSlide, setActiveSlide] = useState(0)
  const slideCount = slideshow?.length ?? 0

  const advance = useCallback(() => {
    if (slideCount > 0) setActiveSlide((prev) => (prev + 1) % slideCount)
  }, [slideCount])

  useEffect(() => {
    if (slideCount <= 1 || !isInView) return
    const iv = setInterval(advance, 3500)
    return () => clearInterval(iv)
  }, [slideCount, isInView, advance])

  const hasMedia = screenshot || video || (slideshow && slideshow.length > 0)

  return (
    <div ref={ref} className={`${bg} overflow-hidden`}>
      <div className="mx-auto max-w-[1600px] px-8 py-24 lg:px-20 lg:py-32">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1fr] lg:gap-20">
          {/* Left: text content */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Colored accent bar + logo */}
            <div className="flex items-center gap-4 mb-8">
              <div
                className="h-10 w-1 rounded-full"
                style={{ backgroundColor: color }}
              />
              {logo && (
                <Image
                  src={logo}
                  alt={headline}
                  width={120}
                  height={36}
                  className={`h-7 w-auto lg:h-8 ${dark ? 'brightness-0 invert' : ''}`}
                />
              )}
            </div>

            <h3 className={`font-display text-[2rem] font-normal leading-[1.15] ${textPrimary} md:text-[2.5rem]`}>
              {headline}
            </h3>

            <div className="mt-6 space-y-4">
              {paragraphs.map((p, i) => (
                <p key={i} className={`font-body text-base leading-relaxed ${textSecondary} lg:text-lg`}>
                  {p}
                </p>
              ))}
            </div>

            {/* Detail blocks */}
            {details && details.length > 0 && (
              <div className="mt-10 space-y-6">
                {details.map((d, i) => (
                  <div key={i} className="border-l-2 pl-5" style={{ borderColor: `${color}40` }}>
                    <p
                      className="font-mono text-xs uppercase tracking-widest"
                      style={{ color }}
                    >
                      {d.label}
                    </p>
                    <p className={`mt-1 font-body text-base leading-relaxed ${textPrimary}`}>
                      {d.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Stats */}
            {stats && stats.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-10">
                {stats.map((s, i) => (
                  <div key={i}>
                    <p
                      className="font-display text-[2rem] font-normal leading-none lg:text-[2.5rem]"
                      style={{ color }}
                    >
                      {s.value}
                    </p>
                    <p className={`mt-1 font-mono text-xs uppercase tracking-wider ${textMuted}`}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Context as consultant */}
            {context && (
              <div
                className="mt-10 rounded-lg p-6"
                style={{ backgroundColor: contextBg }}
              >
                <p className={`font-mono text-xs uppercase tracking-widest ${textMuted} mb-2`}>
                  Was das mit meiner Beratung zu tun hat
                </p>
                <p className={`font-body text-base leading-relaxed ${textPrimary}`}>
                  {context}
                </p>
              </div>
            )}

            {/* Link */}
            {link && (
              <div className="mt-10">
                <Link
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 rounded-full border-2 px-6 py-3 font-mono text-sm uppercase tracking-wider transition-all hover:opacity-80 ${dark ? 'border-white/30 text-white' : ''}`}
                  style={dark ? {} : { borderColor: color, color }}
                >
                  {link.label}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 11L11 3M11 3H5M11 3V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Right: media */}
          {hasMedia && (
            <motion.div
              className="relative flex items-end lg:self-end"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
            >
              {/* Slideshow – oversized, right-cropped like screenshot */}
              {slideshow && slideshow.length > 0 ? (
                <div className="w-full lg:absolute lg:bottom-0 lg:left-0 lg:w-[160%] lg:-mb-32">
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    {slideshow.map((slide, i) => (
                      <motion.div
                        key={i}
                        className="absolute inset-0"
                        animate={{ opacity: i === activeSlide ? 1 : 0 }}
                        transition={{ duration: 1.2, ease: 'easeInOut' }}
                      >
                        <Image
                          src={slide.src}
                          alt={slide.alt || ''}
                          fill
                          className="object-cover object-left-top"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : video ? (
                <div className="w-full overflow-hidden rounded-2xl">
                  <video
                    src={video.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full"
                  />
                </div>
              ) : screenshot ? (
                <div className="w-full lg:absolute lg:bottom-0 lg:left-0 lg:w-[210%] lg:-mb-32">
                  <Image
                    src={screenshot.src}
                    alt={screenshot.alt}
                    width={2166}
                    height={1212}
                    className="w-full"
                  />
                </div>
              ) : null}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
