'use client'

import { motion } from 'framer-motion'
import { getIcon } from '@/lib/icons'

interface Step {
  title: string
  body: string
  icon?: string
}

interface StepsSlideProps {
  headline: string
  subtext?: string
  steps: Step[]
}

const stepVariants = {
  hidden: { opacity: 0, x: -30 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const, delay: i * 0.15 },
  }),
}

export function StepsSlide({ headline, subtext, steps }: StepsSlideProps) {
  return (
    <div className="bg-surface-light py-section-mobile lg:py-section-desktop">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-center font-display text-h2 font-normal text-text-primary">
          {headline}
        </h2>
        {subtext ? (
          <p className="mx-auto mt-4 max-w-2xl text-center font-body text-body text-text-muted">
            {subtext}
          </p>
        ) : null}

        <div className="relative mt-12">
          <motion.div
            aria-hidden
            className="absolute bottom-0 left-[1.125rem] top-[1.125rem] w-px origin-top bg-border md:left-[1.25rem]"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
          />

          <ol className="relative space-y-0">
            {steps.map((step, index) => {
              const Icon = step.icon ? getIcon(step.icon) : null
              return (
                <motion.li
                  key={`${step.title}-${index}`}
                  className="relative flex gap-6 pb-12 last:pb-0"
                  variants={stepVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-80px' }}
                  custom={index}
                >
                  <div className="relative z-10 flex shrink-0 flex-col items-center">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand font-display text-lg font-semibold text-white md:h-10 md:w-10 md:text-xl">
                      {index + 1}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 pt-0.5">
                    {Icon ? (
                      <Icon
                        className="mb-3 h-6 w-6 text-brand"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                    ) : null}
                    <h3 className="font-display text-h3 font-semibold text-text-primary">
                      {step.title}
                    </h3>
                    <p className="mt-2 font-body text-body leading-relaxed text-text-dimmed">
                      {step.body}
                    </p>
                  </div>
                </motion.li>
              )
            })}
          </ol>
        </div>
      </div>
    </div>
  )
}
