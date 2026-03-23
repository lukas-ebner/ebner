'use client'

import { createElement } from 'react'
import { motion } from 'framer-motion'
import { getIcon } from '@/lib/icons'

interface FeatureItem {
  icon?: string
  number?: number
  title: string
  body: string
}

interface FeatureListSlideProps {
  headline: string
  subtext?: string
  items: FeatureItem[]
  variant?: 'light' | 'dark'
  columns?: 1 | 2
}

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' as const },
  },
}

function FeatureRow({
  item,
  index,
  titleClass,
  bodyClass,
}: {
  item: FeatureItem
  index: number
  titleClass: string
  bodyClass: string
}) {
  const num = item.number ?? (!item.icon ? index + 1 : undefined)

  return (
    <div className="flex gap-6">
      <div className="flex w-16 shrink-0 justify-end">
        {item.icon && getIcon(item.icon) ? (
          createElement(getIcon(item.icon)!, {
            className: 'h-8 w-8 text-brand',
            strokeWidth: 1.5,
            'aria-hidden': true,
          })
        ) : num != null ? (
          <span className="font-display text-[48px] font-bold leading-none text-brand/30">
            {num}
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className={`font-display text-h3 font-semibold ${titleClass}`}>{item.title}</h3>
        <p className={`mt-2 font-body text-body leading-relaxed ${bodyClass}`}>{item.body}</p>
      </div>
    </div>
  )
}

export function FeatureListSlide({
  headline,
  subtext,
  items,
  variant = 'light',
  columns = 1,
}: FeatureListSlideProps) {
  const isDark = variant === 'dark'
  const sectionBg = isDark ? 'bg-surface-dark' : 'bg-surface-light'
  const headlineClass = isDark ? 'text-text-light' : 'text-text-primary'
  const subtextClass = isDark ? 'text-text-muted' : 'text-text-muted'
  const titleClass = isDark ? 'text-text-light' : 'text-text-primary'
  const bodyClass = isDark ? 'text-text-muted' : 'text-text-dimmed'
  const borderClass = isDark ? 'divide-border-dark' : 'divide-border'

  const twoCol = Number(columns) === 2

  if (twoCol) {
    return (
      <div className={`py-section-mobile lg:py-section-desktop ${sectionBg}`}>
        <div className="mx-auto max-w-5xl px-6">
          <h2 className={`text-center font-display text-h2 font-normal ${headlineClass}`}>
            {headline}
          </h2>
          {subtext ? (
            <p className={`mx-auto mt-4 max-w-2xl text-center font-body text-body ${subtextClass}`}>
              {subtext}
            </p>
          ) : null}
          <motion.ul
            className="mt-12 grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2"
            variants={listVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            {items.map((item, i) => (
              <motion.li key={`${item.title}-${i}`} variants={itemVariants}>
                <FeatureRow
                  item={item}
                  index={i}
                  titleClass={titleClass}
                  bodyClass={bodyClass}
                />
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    )
  }

  return (
    <div className={`py-section-mobile lg:py-section-desktop ${sectionBg}`}>
      <div className="mx-auto max-w-3xl px-6">
        <h2 className={`text-center font-display text-h2 font-normal ${headlineClass}`}>
          {headline}
        </h2>
        {subtext ? (
          <p className={`mx-auto mt-4 max-w-2xl text-center font-body text-body ${subtextClass}`}>
            {subtext}
          </p>
        ) : null}
        <motion.div
          className={`mt-12 divide-y ${borderClass}`}
          variants={listVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {items.map((item, i) => (
            <motion.div
              key={`${item.title}-${i}`}
              variants={itemVariants}
              className="py-8 first:pt-0 last:pb-0"
            >
              <FeatureRow
                item={item}
                index={i}
                titleClass={titleClass}
                bodyClass={bodyClass}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
