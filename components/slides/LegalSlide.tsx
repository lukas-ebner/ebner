'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface LegalSection {
  heading?: string
  body: string
}

interface LegalSlideProps {
  headline: string
  sections: LegalSection[]
}

function bodyParagraphs(body: string): string[] {
  return body
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 0)
    .map((p) => p.trim())
}

export function LegalSlide({ headline, sections }: LegalSlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <div ref={ref} className="bg-white py-section-mobile lg:py-section-desktop">
      <motion.div
        className="mx-auto max-w-[780px] px-8 lg:px-12"
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <h1 className="font-display text-h2 font-normal leading-tight text-text-primary lg:text-h1">
          {headline}
        </h1>

        <div className="mt-12 space-y-10">
          {sections.map((section, i) => (
            <div key={i}>
              {section.heading && (
                <h2 className="mb-4 font-display text-xl font-normal text-text-primary lg:text-2xl">
                  {section.heading}
                </h2>
              )}
              <div className="space-y-4">
                {bodyParagraphs(section.body).map((p, j) => (
                  <p
                    key={j}
                    className="font-body text-base leading-relaxed text-text-secondary lg:text-lg"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
