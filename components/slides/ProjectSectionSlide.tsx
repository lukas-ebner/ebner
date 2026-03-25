'use client'

import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface ProjectSectionSlideProps {
  id: string
  color: string
  logo?: string
  headline: string
  role?: string
  body: string
  stats?: { value: string; label: string }[]
  image?: { src: string; alt: string }
  screenshot?: { src: string; alt: string }
  link?: { url: string; label: string }
  layout?: 'hero' | 'split-left' | 'split-right'
}

function bodyParagraphs(body: string): string[] {
  return body
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 0)
    .map((p) => p.trim())
}

/* ── Full-bleed hero layout ── */
function HeroLayout({
  id,
  color,
  logo,
  headline,
  role,
  body,
  stats,
  image,
  screenshot,
  link,
}: ProjectSectionSlideProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '-10%'])
  const paragraphs = bodyParagraphs(body)

  return (
    <div id={id} ref={ref} className="relative overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* Parallax background */}
      {image && (
        <motion.div
          className="absolute inset-0 h-[120%] w-full"
          style={{ top: '-10%', y: bgY }}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, ${color}ee 0%, ${color}cc 40%, ${color}99 70%, ${color}ee 100%)`,
            }}
          />
        </motion.div>
      )}

      {/* No-image fallback */}
      {!image && (
        <div className="absolute inset-0" style={{ backgroundColor: color }} />
      )}

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col justify-center">
        <div className="mx-auto w-full max-w-[1600px] px-8 py-32 lg:px-20 lg:py-40">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* Logo */}
            {logo && (
              <div className="mb-8">
                <Image
                  src={logo}
                  alt={headline}
                  width={160}
                  height={48}
                  className="h-10 w-auto brightness-0 invert lg:h-12"
                />
              </div>
            )}

            {/* Role pill */}
            {role && (
              <span className="mb-4 inline-block rounded-full border border-white/20 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-white/70">
                {role}
              </span>
            )}

            {/* Headline */}
            <h2 className="max-w-[800px] font-display text-[2.5rem] font-normal leading-[1.1] text-white md:text-[3.5rem] lg:text-[4.25rem]">
              {headline}
            </h2>

            {/* Body */}
            <div className="mt-8 max-w-[560px] space-y-4">
              {paragraphs.map((p, i) => (
                <p key={i} className="font-body text-lg leading-relaxed text-white/70 lg:text-xl">
                  {p}
                </p>
              ))}
            </div>

            {/* Stats */}
            {stats && stats.length > 0 && (
              <div className="mt-12 flex flex-wrap gap-12">
                {stats.map((s, i) => (
                  <div key={i}>
                    <p className="font-display text-[2.5rem] font-normal leading-none text-white lg:text-[3rem]">
                      {s.value}
                    </p>
                    <p className="mt-1 font-mono text-xs uppercase tracking-wider text-white/50">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Screenshot */}
            {screenshot && (
              <motion.div
                className="mt-16 max-w-[900px]"
                initial={{ opacity: 0, y: 60 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              >
                <div className="overflow-hidden rounded-xl shadow-2xl">
                  <Image
                    src={screenshot.src}
                    alt={screenshot.alt}
                    width={1200}
                    height={750}
                    className="w-full"
                  />
                </div>
              </motion.div>
            )}

            {/* Link */}
            {link && (
              <div className="mt-12">
                <Link
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-mono text-sm uppercase tracking-wider text-white/80 transition-all hover:border-white/40 hover:text-white"
                >
                  {link.label}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 11L11 3M11 3H5M11 3V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

/* ── Split layout (text + image side by side) ── */
function SplitLayout({
  id,
  color,
  logo,
  headline,
  role,
  body,
  stats,
  image,
  screenshot,
  link,
  layout,
}: ProjectSectionSlideProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const paragraphs = bodyParagraphs(body)
  const isRight = layout === 'split-right'
  const displayImage = screenshot || image

  return (
    <div id={id} ref={ref} style={{ backgroundColor: color }}>
      <div className={`mx-auto grid min-h-[70vh] max-w-[1600px] grid-cols-1 items-center gap-0 lg:grid-cols-2`}>
        {/* Text */}
        <motion.div
          className={`flex flex-col justify-center px-8 py-20 lg:px-20 lg:py-32 ${isRight ? 'lg:order-2' : ''}`}
          initial={{ opacity: 0, x: isRight ? 30 : -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {logo && (
            <div className="mb-6">
              <Image
                src={logo}
                alt={headline}
                width={140}
                height={40}
                className="h-8 w-auto brightness-0 invert lg:h-10"
              />
            </div>
          )}

          {role && (
            <span className="mb-3 inline-block w-fit rounded-full border border-white/20 px-3 py-1 font-mono text-xs uppercase tracking-widest text-white/60">
              {role}
            </span>
          )}

          <h3 className="max-w-[500px] font-display text-[2rem] font-normal leading-[1.15] text-white md:text-[2.5rem] lg:text-[3rem]">
            {headline}
          </h3>

          <div className="mt-6 max-w-[480px] space-y-3">
            {paragraphs.map((p, i) => (
              <p key={i} className="font-body text-base leading-relaxed text-white/65 lg:text-lg">
                {p}
              </p>
            ))}
          </div>

          {stats && stats.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-8">
              {stats.map((s, i) => (
                <div key={i}>
                  <p className="font-display text-[2rem] font-normal leading-none text-white">
                    {s.value}
                  </p>
                  <p className="mt-1 font-mono text-xs uppercase tracking-wider text-white/50">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {link && (
            <div className="mt-8">
              <Link
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-white/70 transition-all hover:border-white/40 hover:text-white"
              >
                {link.label}
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M3 11L11 3M11 3H5M11 3V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          )}
        </motion.div>

        {/* Image */}
        <motion.div
          className={`relative min-h-[400px] lg:min-h-[70vh] ${isRight ? 'lg:order-1' : ''}`}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
        >
          {displayImage && (
            <Image
              src={displayImage.src}
              alt={displayImage.alt}
              fill
              className="object-cover"
              sizes="50vw"
            />
          )}
        </motion.div>
      </div>
    </div>
  )
}

export function ProjectSectionSlide(props: ProjectSectionSlideProps) {
  const layout = props.layout ?? 'hero'
  if (layout === 'hero') return <HeroLayout {...props} />
  return <SplitLayout {...props} />
}
