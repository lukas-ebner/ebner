'use client'

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

        <ol className="relative mt-12 space-y-0">
          {steps.map((step, index) => {
            const Icon = step.icon ? getIcon(step.icon) : null
            const isLast = index === steps.length - 1
            return (
              <li key={`${step.title}-${index}`} className="relative flex gap-6 pb-12 last:pb-0">
                {!isLast ? (
                  <div
                    className="absolute left-[1.125rem] top-14 w-px bg-border md:left-[1.25rem] md:top-16"
                    style={{ height: 'calc(100% - 0.5rem)' }}
                    aria-hidden
                  />
                ) : null}

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
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
