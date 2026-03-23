'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface QualificationItem {
  text: string
}

interface QualificationSlideProps {
  headline: string
  body?: string
  qualifies: QualificationItem[]
  disqualifies: QualificationItem[]
  qualifiesLabel?: string
  disqualifiesLabel?: string
}

export function QualificationSlide({
  headline,
  body,
  qualifies,
  disqualifies,
  qualifiesLabel = 'Das passt',
  disqualifiesLabel = 'Das passt nicht',
}: QualificationSlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <div ref={ref} className="bg-white">
      <div className="mx-auto max-w-[1600px] px-8 py-32 lg:px-20 lg:py-48">
        {/* ── Headline ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="max-w-[700px] font-display text-[2.5rem] font-normal leading-[1.1] text-text-primary md:text-[3.5rem] lg:text-[4.25rem]">
            {headline}
          </h2>
          {body && (
            <p className="mt-6 max-w-[600px] font-body text-lg leading-relaxed text-text-secondary lg:text-xl">
              {body}
            </p>
          )}
        </motion.div>

        {/* ── Two columns: Qualifies / Disqualifies ── */}
        <motion.div
          className="mt-16 grid grid-cols-1 gap-12 lg:mt-24 lg:grid-cols-2 lg:gap-20"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
        >
          {/* Green – qualifies */}
          <div>
            <span className="mb-8 inline-block rounded-full bg-emerald-50 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-emerald-700">
              {qualifiesLabel}
            </span>
            <ul className="space-y-6">
              {qualifies.map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                    >
                      <path
                        d="M2.5 7.5L5.5 10.5L11.5 3.5"
                        stroke="#059669"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="font-body text-lg leading-snug text-text-primary lg:text-xl">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Red – disqualifies */}
          <div>
            <span className="mb-8 inline-block rounded-full bg-red-50 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-red-700">
              {disqualifiesLabel}
            </span>
            <ul className="space-y-6">
              {disqualifies.map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                    >
                      <path
                        d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5"
                        stroke="#DC2626"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="font-body text-lg leading-snug text-text-secondary lg:text-xl">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
