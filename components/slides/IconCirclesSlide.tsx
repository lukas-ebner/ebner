'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { getIcon } from '@/lib/icons'

interface CircleItem {
  icon: string
  title: string
  body: string
}

interface IconCirclesSlideProps {
  headline: string
  subtext?: string
  items: CircleItem[]
}

function bodyParagraphs(body: string): string[] {
  return body
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 0)
    .map((p) => p.trim())
}

export function IconCirclesSlide({
  headline,
  subtext,
  items,
}: IconCirclesSlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      className="relative min-h-screen bg-surface-dark"
    >
      <div className="mx-auto max-w-[1600px] px-8 py-32 lg:px-20 lg:py-48">
        {/* ── Headline ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="max-w-[720px] font-display text-[2.5rem] font-normal leading-[1.1] text-text-light md:text-[3.5rem] lg:text-[4.25rem]">
            {headline}
          </h2>
          {subtext && (
            <p className="mt-6 max-w-[560px] font-body text-lg leading-relaxed text-text-light/60 lg:text-xl">
              {subtext}
            </p>
          )}
        </motion.div>

        {/* ── Circles Grid ── */}
        <div className="mt-24 grid grid-cols-1 gap-16 md:grid-cols-3 lg:mt-32 lg:gap-[60px]">
          {items.map((item, i) => {
            const Icon = getIcon(item.icon)
            const paragraphs = bodyParagraphs(item.body)

            return (
              <motion.div
                key={i}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.55,
                  ease: 'easeOut',
                  delay: 0.15 + i * 0.12,
                }}
              >
                {/* Circle */}
                <div className="flex h-[160px] w-[160px] items-center justify-center rounded-full border border-white/20 lg:h-[200px] lg:w-[200px]">
                  {Icon && (
                    <Icon
                      size={56}
                      strokeWidth={1}
                      className="text-white lg:h-[72px] lg:w-[72px]"
                    />
                  )}
                </div>

                {/* Title */}
                <h3 className="mt-8 font-display text-[1.5rem] font-normal leading-[1.2] text-text-light lg:text-[1.75rem]">
                  {item.title}
                </h3>

                {/* Body */}
                <div className="mt-4 max-w-[360px] space-y-3">
                  {paragraphs.map((p, j) => (
                    <p
                      key={j}
                      className="font-body text-base leading-relaxed text-text-light/60"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
