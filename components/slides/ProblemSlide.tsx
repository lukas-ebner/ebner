'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import type { ImageConfig } from '@/lib/types'

interface Symptom {
  pill: string
  headline: string
  body: string
  image: ImageConfig
}

interface ProblemSlideProps {
  headline?: string
  body?: string
  symptoms: Symptom[]
}

function bodyParagraphs(body: string): string[] {
  return body
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 0)
    .map((p) => p.trim())
}

export function ProblemSlide({ headline, body, symptoms }: ProblemSlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const paragraphs = body ? bodyParagraphs(body) : []
  const hasIntro = headline || paragraphs.length > 0

  return (
    <div ref={ref} className="bg-white">
      {/* ── Headline + Intro (optional, side-by-side on desktop) ── */}
      {hasIntro && (
        <motion.div
          className="mx-auto max-w-[1600px] px-8 pt-32 lg:px-20 lg:pt-48"
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {headline && paragraphs.length > 0 ? (
            /* Both headline + body → side by side on lg */
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-20">
              <h2 className="font-display text-[2.5rem] font-normal leading-[1.1] text-text-primary md:text-[3.5rem] lg:text-[4.25rem]">
                {headline}
              </h2>
              <div className="space-y-4 lg:pt-4">
                {paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className="font-body text-lg leading-relaxed text-text-secondary lg:text-xl"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            /* Only headline or only body → single column */
            <>
              {headline && (
                <h2 className="max-w-[720px] font-display text-[2.5rem] font-normal leading-[1.1] text-text-primary md:text-[3.5rem] lg:text-[4.25rem]">
                  {headline}
                </h2>
              )}
              {paragraphs.length > 0 && (
                <div className="mt-8 max-w-[640px] space-y-4">
                  {paragraphs.map((p, i) => (
                    <p
                      key={i}
                      className="font-body text-lg leading-relaxed text-text-secondary lg:text-xl"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* ── Symptoms ── */}
      {symptoms.length > 0 && (
      <div className={`mx-auto max-w-[1600px] px-8 pb-32 lg:px-20 lg:pb-48 ${hasIntro ? 'pt-24 lg:pt-40' : 'pt-32 lg:pt-48'}`}>
        {symptoms.map((symptom, i) => {
          const isEven = i % 2 === 0
          return (
            <SymptomBlock
              key={i}
              symptom={symptom}
              imageRight={isEven}
              index={i}
            />
          )
        })}
      </div>
      )}
    </div>
  )
}

function SymptomBlock({
  symptom,
  imageRight,
  index,
}: {
  symptom: Symptom
  imageRight: boolean
  index: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const paragraphs = bodyParagraphs(symptom.body)

  const textBlock = (
    <div className="flex flex-col justify-center py-8 lg:py-0">
      <span className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-text-primary">
        {symptom.pill}
      </span>
      <h3 className="font-display text-[1.75rem] font-normal leading-[1.15] text-text-primary md:text-[2.25rem] lg:text-[2.75rem]">
        {symptom.headline}
      </h3>
      <div className="mt-4 space-y-3">
        {paragraphs.map((p, i) => (
          <p
            key={i}
            className="font-body text-base leading-relaxed text-text-secondary lg:text-lg"
          >
            {p}
          </p>
        ))}
      </div>
    </div>
  )

  const imageBlock = (
    <div className="relative aspect-video w-full overflow-hidden rounded-sm shadow-lg">
      <ImageWithFallback
        src={symptom.image.src}
        alt={symptom.image.alt ?? ''}
        fill
        className="object-cover object-center"
        sizes="(max-width: 768px) 100vw, 720px"
        label={`Symptom ${index + 1}`}
      />
    </div>
  )

  return (
    <motion.div
      ref={ref}
      className={`mb-24 grid grid-cols-1 items-center gap-[60px] last:mb-0 lg:mb-32 lg:grid-cols-2`}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
    >
      {imageRight ? (
        <>
          {textBlock}
          {imageBlock}
        </>
      ) : (
        <>
          {imageBlock}
          {textBlock}
        </>
      )}
    </motion.div>
  )
}
