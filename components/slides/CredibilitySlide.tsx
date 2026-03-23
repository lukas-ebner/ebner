'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect, useCallback } from 'react'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { ExternalLink } from 'lucide-react'
import type { ImageConfig } from '@/lib/types'

interface Proof {
  text: string
}

interface SecondaryCta {
  label: string
  href: string
  external?: boolean
}

interface CredibilitySlideProps {
  headline: string
  body: string
  proofs?: Proof[]
  cta?: { label: string; href: string }
  secondaryCta?: SecondaryCta
  image?: ImageConfig
  slideshow?: { src: string; alt?: string }[]
  bg?: string
}

const SLIDE_INTERVAL = 4000

function bodyParagraphs(body: string): string[] {
  return body
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 0)
    .map((p) => p.trim())
}

export function CredibilitySlide({
  headline,
  body,
  proofs,
  cta,
  secondaryCta,
  image,
  slideshow,
  bg = '#F44900',
}: CredibilitySlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const paragraphs = bodyParagraphs(body)

  /* ── Slideshow auto-advance ── */
  const [activeSlide, setActiveSlide] = useState(0)
  const slideCount = slideshow?.length ?? 0

  const advance = useCallback(() => {
    if (slideCount > 0) setActiveSlide((prev) => (prev + 1) % slideCount)
  }, [slideCount])

  useEffect(() => {
    if (slideCount <= 1 || !isInView) return
    const iv = setInterval(advance, SLIDE_INTERVAL)
    return () => clearInterval(iv)
  }, [slideCount, isInView, advance])

  const hasSlideshow = slideshow && slideshow.length > 0

  return (
    <section
      ref={ref}
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: bg }}
    >
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-2">
        {/* ── Text Column ── */}
        <motion.div
          className="flex flex-col justify-center px-8 py-20 lg:px-20 lg:py-32"
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="max-w-[560px] font-display text-[2.5rem] font-normal leading-[1.1] text-white md:text-[3.5rem] lg:text-[4.25rem]">
            {headline}
          </h2>

          <div className="mt-8 max-w-[480px] space-y-4">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className="font-body text-lg leading-relaxed text-white/80 lg:text-xl"
              >
                {p}
              </p>
            ))}
          </div>

          {proofs && proofs.length > 0 && (
            <ul className="mt-10 space-y-4">
              {proofs.map((proof, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className="text-white"
                    >
                      <path
                        d="M2 6.5L4.5 9L10 3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="font-body text-base text-white lg:text-lg">
                    {proof.text}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* CTAs */}
          {(cta || secondaryCta) && (
            <div className="mt-12 flex flex-wrap items-center gap-4">
              {cta && (
                <a
                  href={cta.href}
                  className="inline-block rounded-full bg-white px-8 py-4 font-mono text-sm font-semibold uppercase tracking-wide text-text-primary transition-transform hover:scale-105"
                >
                  {cta.label}
                </a>
              )}
              {secondaryCta && (
                <a
                  href={secondaryCta.href}
                  target={secondaryCta.external ? '_blank' : undefined}
                  rel={secondaryCta.external ? 'noopener noreferrer' : undefined}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white/60 px-8 py-[14px] font-mono text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  {secondaryCta.label}
                  {secondaryCta.external && (
                    <ExternalLink className="h-4 w-4" strokeWidth={2} />
                  )}
                </a>
              )}
            </div>
          )}
        </motion.div>

        {/* ── Right Column: Single Image (non-slideshow) ── */}
        {!hasSlideshow && image && (
          <motion.div
            className="relative flex items-center justify-center overflow-hidden lg:items-center lg:justify-end"
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
          >
            <div className="relative h-[70vh] w-full lg:h-full">
              <ImageWithFallback
                src={image.src}
                alt={image.alt ?? ''}
                fill
                className="object-contain object-bottom"
                sizes="(max-width: 768px) 80vw, 40vw"
                label="Credibility"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Slideshow: positioned absolute, bleeds to right viewport edge ── */}
      {hasSlideshow && (
        <motion.div
          className="absolute right-0 top-[30%] hidden h-[760px] w-[55%] lg:block"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
        >
          <div className="relative h-full w-full overflow-hidden">
            {/* All slides stacked – only active one is visible (crossfade) */}
            {slideshow!.map((slide, i) => (
              <motion.div
                key={i}
                className="absolute inset-0"
                animate={{ opacity: i === activeSlide ? 1 : 0 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
              >
                <ImageWithFallback
                  src={slide.src}
                  alt={slide.alt ?? ''}
                  fill
                  className="object-cover object-left-top"
                  sizes="55vw"
                  label={`Leadtime ${i + 1}`}
                />
              </motion.div>
            ))}

            {/* Slide indicators */}
            {slideCount > 1 && (
              <div className="absolute -bottom-10 left-8 z-10 flex gap-2">
                {slideshow!.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeSlide
                        ? 'w-8 bg-white'
                        : 'w-3 bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Mobile slideshow */}
      {hasSlideshow && (
        <div className="relative h-[50vh] w-full lg:hidden">
          {slideshow!.map((slide, i) => (
            <motion.div
              key={i}
              className="absolute inset-0"
              animate={{ opacity: i === activeSlide ? 1 : 0 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            >
              <ImageWithFallback
                src={slide.src}
                alt={slide.alt ?? ''}
                fill
                className="object-cover object-left-top"
                sizes="100vw"
                label={`Leadtime ${i + 1}`}
              />
            </motion.div>
          ))}
          {slideCount > 1 && (
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {slideshow!.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeSlide
                      ? 'w-8 bg-white'
                      : 'w-3 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
