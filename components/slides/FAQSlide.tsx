'use client'

import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

interface FAQSlideProps {
  headline: string
  items: FAQItem[]
  variant?: 'light' | 'dark'
  bg?: string
}

function FAQAccordionItem({
  item,
  isDark,
}: {
  item: FAQItem
  isDark: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={`border-b ${
        isDark ? 'border-white/10' : 'border-text-primary/10'
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className={`flex w-full items-start gap-4 py-6 text-left transition-colors ${
          isDark ? 'hover:text-white' : 'hover:text-text-primary'
        }`}
      >
        <span
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center font-body text-xl leading-none ${
            isDark ? 'text-white/40' : 'text-text-muted'
          }`}
        >
          {open ? '−' : '+'}
        </span>
        <span
          className={`font-display text-lg font-normal leading-snug lg:text-xl ${
            isDark ? 'text-text-light' : 'text-text-primary'
          }`}
        >
          {item.question}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-6 pl-10 pr-4">
              <p
                className={`font-body text-base leading-relaxed ${
                  isDark ? 'text-text-light/60' : 'text-text-secondary'
                }`}
              >
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FAQSlide({
  headline,
  items,
  variant = 'dark',
  bg,
}: FAQSlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const isDark = variant === 'dark'

  // Split items into two columns
  const mid = Math.ceil(items.length / 2)
  const leftItems = items.slice(0, mid)
  const rightItems = items.slice(mid)

  const bgClass = bg
    ? ''
    : isDark
      ? 'bg-surface-dark'
      : 'bg-white'

  return (
    <div
      ref={ref}
      className={bgClass}
      style={bg ? { backgroundColor: bg } : undefined}
    >
      <div className="mx-auto max-w-[1600px] px-8 py-32 lg:px-20 lg:py-48">
        {/* ── Headline ── */}
        <motion.h2
          className={`mb-16 max-w-[700px] font-display text-[2.5rem] font-normal leading-[1.1] md:text-[3.5rem] lg:mb-24 lg:text-[4.25rem] ${
            isDark ? 'text-text-light' : 'text-text-primary'
          }`}
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {headline}
        </motion.h2>

        {/* ── Two-column FAQ grid ── */}
        <motion.div
          className="grid grid-cols-1 gap-x-16 lg:grid-cols-2"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
        >
          <div>
            {leftItems.map((item, i) => (
              <FAQAccordionItem key={i} item={item} isDark={isDark} />
            ))}
          </div>
          <div>
            {rightItems.map((item, i) => (
              <FAQAccordionItem key={i} item={item} isDark={isDark} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
