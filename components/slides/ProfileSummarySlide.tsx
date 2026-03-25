'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'

interface ProfileFact {
  label: string
  value: string
}

interface ProfileCert {
  title: string
  org: string
  year: string
}

interface ProfileSummarySlideProps {
  headline: string
  subtext?: string
  image?: { src: string; alt: string }
  facts: ProfileFact[]
  certifications?: ProfileCert[]
  cta?: { text: string; url: string }
  variant?: 'light' | 'dark'
  bg?: string
}

export function ProfileSummarySlide({
  headline,
  subtext,
  image,
  facts,
  certifications,
  cta,
  variant = 'light',
  bg,
}: ProfileSummarySlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const isDark = variant === 'dark'

  const bgClass = bg
    ? ''
    : isDark
      ? 'bg-surface-dark'
      : 'bg-surface-light'

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
          <div className="grid lg:grid-cols-3 gap-10 lg:gap-16 items-start">
            {/* Left: Image + Name */}
            {image && (
              <div className="lg:col-span-1">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
              </div>
            )}

            {/* Right: Content */}
            <div className={image ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <h2 className={`font-display text-h2 font-normal ${isDark ? 'text-text-light' : 'text-text-primary'}`}>
                {headline}
              </h2>
              {subtext && (
                <p className={`mt-3 max-w-xl font-body text-body leading-relaxed ${isDark ? 'text-text-light/60' : 'text-text-dimmed'}`}>
                  {subtext}
                </p>
              )}

              {/* Key Facts Grid */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                {facts.map((fact, i) => (
                  <motion.div
                    key={fact.label}
                    initial={{ opacity: 0, y: 15 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    className={`rounded-xl p-4 ${isDark ? 'bg-white/5' : 'bg-white'}`}
                  >
                    <span className={`block font-display text-[1.5rem] font-bold ${isDark ? 'text-text-light' : 'text-text-primary'}`}>
                      {fact.value}
                    </span>
                    <span className={`mt-0.5 block font-body text-sm ${isDark ? 'text-text-light/50' : 'text-text-dimmed'}`}>
                      {fact.label}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Certifications */}
              {certifications && certifications.length > 0 && (
                <div className="mt-8">
                  <h3 className={`font-mono text-[11px] uppercase tracking-[0.2em] ${isDark ? 'text-text-light/40' : 'text-text-dimmed'}`}>
                    Weiterbildung
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {certifications.map((cert) => (
                      <span
                        key={cert.title}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-body text-xs ${
                          isDark ? 'bg-white/10 text-text-light/70' : 'bg-white text-text-dimmed'
                        }`}
                      >
                        <span className="font-medium">{cert.title}</span>
                        <span className="opacity-40">·</span>
                        <span>{cert.year}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              {cta && (
                <a
                  href={cta.url}
                  className="mt-8 inline-flex items-center gap-2 font-body text-sm font-medium text-brand hover:underline"
                >
                  {cta.text} →
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
