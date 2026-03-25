'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'

interface Certificate {
  title: string
  org: string
  year: string
  logo?: string
}

interface CertificatesSlideProps {
  headline: string
  subtext?: string
  items: Certificate[]
}

export function CertificatesSlide({ headline, subtext, items }: CertificatesSlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <div ref={ref} className="bg-surface-light py-section-mobile lg:py-section-desktop">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <h2 className="font-display text-h2 font-normal text-text-primary">
          {headline}
        </h2>
        {subtext && (
          <p className="mt-3 max-w-2xl font-body text-body text-text-dimmed">{subtext}</p>
        )}

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((cert, i) => (
            <motion.div
              key={`${cert.title}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, ease: 'easeOut', delay: i * 0.08 }}
              className="group relative flex flex-col rounded-2xl border border-border bg-white p-6 transition-shadow hover:shadow-lg"
            >
              {/* Logo area */}
              {cert.logo ? (
                <div className="mb-5 flex h-12 items-center">
                  <Image
                    src={cert.logo}
                    alt={cert.org}
                    width={120}
                    height={48}
                    className="h-10 w-auto object-contain object-left"
                  />
                </div>
              ) : (
                <div className="mb-5 flex h-12 items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand">
                      <path d="M12 15l-2 5l1-3h2l1 3l-2-5z" />
                      <circle cx="12" cy="9" r="6" />
                      <path d="M12 6v6l3-2" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Content */}
              <h3 className="font-display text-lg font-semibold leading-tight text-text-primary">
                {cert.title}
              </h3>
              <p className="mt-1.5 font-body text-sm text-text-dimmed">
                {cert.org}
              </p>

              {/* Year badge */}
              <div className="mt-auto pt-4">
                <span className="inline-block rounded-full bg-surface-light px-3 py-1 font-mono text-xs tracking-wider text-text-dimmed">
                  {cert.year}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
