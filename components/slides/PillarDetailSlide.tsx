'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { Button } from '@/components/ui/Button'
import { getIcon } from '@/lib/icons'
import type { ImageConfig, CtaConfig } from '@/lib/types'

interface StepItem {
  icon: string
  title: string
  body: string
}

interface ToolIcon {
  src: string
}

interface PipelinePhase {
  icon: string
  label: string
}

/* Organic float animations for tool icons */
const FLOAT_VARIANTS = [
  { y: [0, -6, 3, -5, 0], x: [0, 3, -2, 4, 0], dur: 7 },
  { y: [0, -4, 5, -7, 0], x: [0, -3, 4, -2, 0], dur: 8.5 },
  { y: [0, 5, -4, 6, 0], x: [0, 4, -3, 2, 0], dur: 6.5 },
  { y: [0, -7, 3, -4, 0], x: [0, -3, 5, -4, 0], dur: 7.5 },
  { y: [0, 4, -6, 3, 0], x: [0, 2, -4, 3, 0], dur: 6 },
]

/* Scattered positions for tool icons (% of container) — intentionally irregular */
const TOOL_SCATTER_POSITIONS = [
  { x: 8, y: 6 },
  { x: 52, y: 3 },
  { x: 28, y: 18 },
  { x: 72, y: 14 },
  { x: 5, y: 34 },
  { x: 42, y: 30 },
  { x: 68, y: 38 },
  { x: 18, y: 52 },
  { x: 55, y: 50 },
  { x: 78, y: 56 },
  { x: 32, y: 68 },
  { x: 62, y: 72 },
  { x: 10, y: 82 },
]

/* Varying sizes for scattered icons */
const TOOL_SIZES = [88, 96, 80, 92, 84, 100, 76, 94, 88, 82, 96, 78, 90]

interface PillarDetailSlideProps {
  pill: string
  headline: string
  body: string
  points?: string[]
  image?: ImageConfig
  steps?: StepItem[]
  tools?: ToolIcon[]
  pipeline?: PipelinePhase[]
  cta?: CtaConfig
  accentColor?: string
  bg?: string
  variant?: 'light' | 'dark'
  direction?: 'left' | 'right'
}

export function PillarDetailSlide({
  pill,
  headline,
  body,
  points,
  image,
  steps,
  tools,
  pipeline,
  cta,
  accentColor = 'var(--color-brand)',
  bg,
  variant = 'dark',
  direction = 'right',
}: PillarDetailSlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const useLightText = bg ? true : variant === 'dark'
  const paragraphs = body.split(/\n\n+/).filter((p) => p.trim().length > 0)

  const bgClass = bg
    ? ''
    : variant === 'dark'
      ? 'bg-surface-dark'
      : 'bg-surface-light'

  const imageOnRight = direction === 'right'
  const hasVisual = !!(image || steps || tools || pipeline)

  return (
    <div
      ref={ref}
      className={`${bgClass} relative min-h-screen overflow-hidden`}
      style={bg ? { backgroundColor: bg } : undefined}
    >
      {/* ── Image: absolute, full height, flush to edge ── */}
      {image && !steps && (
        <motion.div
          className={`hidden lg:block absolute top-0 bottom-0 w-[48%] ${
            imageOnRight ? 'right-0' : 'left-0'
          }`}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <ImageWithFallback
            src={image.src}
            alt={image.alt || ''}
            fill
            className="object-cover"
            sizes="50vw"
            label={image.alt || ''}
          />
        </motion.div>
      )}

      {/* ── Content layer ── */}
      <div className="relative z-10 flex min-h-screen flex-col justify-center py-section-mobile lg:py-section-desktop">
        <div className="mx-auto w-full max-w-[1800px] px-8 lg:px-16">
          <div
            className={`flex flex-col gap-12 lg:gap-0 ${
              hasVisual ? 'lg:flex-row lg:items-center' : ''
            }`}
          >
            {/* ── Text side ── */}
            <motion.div
              className={`${
                hasVisual
                  ? (steps || tools || pipeline)
                    ? imageOnRight
                      ? 'lg:w-[50%] lg:pr-16'
                      : 'lg:w-[50%] lg:ml-auto lg:pl-16'
                    : imageOnRight
                      ? 'lg:w-[48%] lg:pr-12'
                      : 'lg:w-[48%] lg:ml-auto lg:pl-12'
                  : 'max-w-[780px]'
              }`}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              {/* Pill */}
              <div
                className="mb-6 inline-block rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-widest"
                style={{
                  borderColor: useLightText ? 'rgba(255,255,255,0.3)' : accentColor,
                  color: useLightText ? 'rgba(255,255,255,0.7)' : accentColor,
                }}
              >
                {pill}
              </div>

              {/* Headline */}
              <h2
                className={`max-w-[700px] font-display text-[2rem] font-normal leading-[1.1] md:text-[2.8rem] lg:text-[3.2rem] ${
                  useLightText ? 'text-white' : 'text-text-primary'
                }`}
              >
                {headline}
              </h2>

              {/* Body */}
              <div className="mt-6 max-w-[620px] space-y-4">
                {paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className={`font-body text-lg leading-relaxed ${
                      useLightText ? 'text-white/70' : 'text-text-secondary'
                    }`}
                  >
                    {p}
                  </p>
                ))}
              </div>

              {/* Points */}
              {points && points.length > 0 && (
                <ul className="mt-8 space-y-3">
                  {points.map((point, i) => (
                    <motion.li
                      key={i}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -12 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                    >
                      <span
                        className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
                        style={{
                          backgroundColor: useLightText ? 'rgba(255,255,255,0.4)' : accentColor,
                        }}
                      />
                      <span
                        className={`font-body text-base ${
                          useLightText ? 'text-white/80' : 'text-text-secondary'
                        }`}
                      >
                        {point}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              )}

              {/* CTA */}
              {cta && (
                <div className="mt-10">
                  <Button
                    href={cta.url}
                    variant={useLightText ? 'outline' : 'outline'}
                    className={
                      useLightText ? '!border-white/30 !text-white hover:!bg-white/10' : ''
                    }
                  >
                    {cta.text}
                  </Button>
                </div>
              )}
            </motion.div>

            {/* ── Steps (horizontal rows: circle + text) ── */}
            {steps && (
              <motion.div
                className={`hidden lg:flex lg:w-[50%] flex-col justify-center gap-12 xl:gap-14 ${
                  imageOnRight ? '' : 'lg:order-first'
                }`}
                initial={{ opacity: 0, x: imageOnRight ? 40 : -40 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                {steps.map((step, i) => {
                  const Icon = getIcon(step.icon)
                  return (
                    <motion.div
                      key={i}
                      className="flex items-center gap-6 xl:gap-8"
                      initial={{ opacity: 0, x: 30 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
                    >
                      {/* Circle */}
                      <div
                        className="flex h-[100px] w-[100px] flex-shrink-0 items-center justify-center rounded-full border xl:h-[120px] xl:w-[120px]"
                        style={{
                          borderColor: useLightText
                            ? 'rgba(255,255,255,0.3)'
                            : 'rgba(0,0,0,0.15)',
                        }}
                      >
                        {Icon && (
                          <Icon
                            size={40}
                            strokeWidth={1}
                            className={useLightText ? 'text-white' : 'text-text-primary'}
                            style={{ width: 40, height: 40 }}
                          />
                        )}
                      </div>

                      {/* Text */}
                      <div>
                        <h3
                          className={`font-display text-[1.4rem] font-normal leading-[1.2] xl:text-[1.6rem] ${
                            useLightText ? 'text-white' : 'text-text-primary'
                          }`}
                        >
                          {step.title}
                        </h3>
                        <p
                          className={`mt-1.5 max-w-[360px] font-body text-base leading-relaxed xl:text-lg ${
                            useLightText ? 'text-white/60' : 'text-text-secondary'
                          }`}
                        >
                          {step.body}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}

            {/* ── Scattered floating tool icons ── */}
            {tools && tools.length > 0 && (
              <motion.div
                className={`hidden lg:block lg:w-[50%] relative ${
                  imageOnRight ? '' : 'lg:order-first'
                }`}
                style={{ minHeight: '600px' }}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {tools.map((tool, i) => {
                  const anim = FLOAT_VARIANTS[i % FLOAT_VARIANTS.length]
                  const pos = TOOL_SCATTER_POSITIONS[i % TOOL_SCATTER_POSITIONS.length]
                  const size = TOOL_SIZES[i % TOOL_SIZES.length]
                  return (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        width: size,
                        height: size,
                      }}
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={
                        isInView
                          ? { opacity: 1, scale: 1, y: anim.y, x: anim.x }
                          : {}
                      }
                      transition={{
                        opacity: { duration: 0.5, delay: 0.4 + i * 0.06 },
                        scale: { duration: 0.5, delay: 0.4 + i * 0.06 },
                        y: {
                          duration: anim.dur,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: i * 0.2,
                        },
                        x: {
                          duration: anim.dur,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: i * 0.2,
                        },
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={tool.src} alt="" className="h-full w-full drop-shadow-lg" />
                    </motion.div>
                  )
                })}
              </motion.div>
            )}

            {/* ── Animated Pipeline ── */}
            {pipeline && pipeline.length > 0 && (
              <motion.div
                className={`hidden lg:flex lg:w-[50%] flex-col items-center justify-center py-8 ${
                  imageOnRight ? '' : 'lg:order-first'
                }`}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="relative flex flex-col items-center">
                  {pipeline.map((phase, i) => {
                    const Icon = getIcon(phase.icon)
                    const isLast = i === pipeline.length - 1
                    return (
                      <div key={i} className="relative flex flex-col items-center">
                        {/* Phase circle */}
                        <motion.div
                          className="relative z-10 flex h-[100px] w-[100px] flex-shrink-0 items-center justify-center rounded-full border-2 xl:h-[110px] xl:w-[110px]"
                          style={{
                            borderColor: 'rgba(255,255,255,0.25)',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                          }}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={isInView ? { opacity: 1, scale: 1 } : {}}
                          transition={{ duration: 0.5, delay: 0.4 + i * 0.18 }}
                        >
                          {Icon && (
                            <Icon
                              size={36}
                              strokeWidth={1.2}
                              className="text-white"
                            />
                          )}
                        </motion.div>

                        {/* Label */}
                        <motion.span
                          className="mt-2.5 font-display text-[1.1rem] tracking-wide text-white xl:text-[1.2rem]"
                          initial={{ opacity: 0, y: 8 }}
                          animate={isInView ? { opacity: 1, y: 0 } : {}}
                          transition={{ duration: 0.4, delay: 0.55 + i * 0.18 }}
                        >
                          {phase.label}
                        </motion.span>

                        {/* Connector line with pulse */}
                        {!isLast && (
                          <div className="relative my-3 flex flex-col items-center">
                            {/* Static line */}
                            <div
                              className="w-[2px] rounded-full"
                              style={{
                                height: '56px',
                                backgroundColor: 'rgba(255,255,255,0.15)',
                              }}
                            />
                            {/* Animated pulse dot — always flows top→bottom */}
                            <motion.div
                              className="absolute left-1/2 h-3 w-3 -translate-x-1/2 rounded-full"
                              style={{
                                backgroundColor: '#F44900',
                                boxShadow: '0 0 12px 4px rgba(244,73,0,0.4)',
                              }}
                              animate={{
                                top: ['-10%', '110%'],
                                opacity: [0, 1, 1, 0],
                              }}
                              transition={{
                                top: {
                                  duration: 1.4,
                                  repeat: Infinity,
                                  ease: 'linear',
                                  delay: i * 0.5,
                                },
                                opacity: {
                                  duration: 1.4,
                                  repeat: Infinity,
                                  ease: 'linear',
                                  delay: i * 0.5,
                                  times: [0, 0.1, 0.9, 1],
                                },
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Live badge */}
                  <motion.div
                    className="mt-6 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 1.2 }}
                  >
                    <motion.div
                      className="h-2.5 w-2.5 rounded-full bg-green-400"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <span className="font-mono text-sm font-medium uppercase tracking-widest text-white">
                      Live
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Mobile steps ── */}
          {/* ── Mobile pipeline ── */}
          {pipeline && pipeline.length > 0 && (
            <div className="mt-10 flex items-center justify-center gap-3 lg:hidden">
              {pipeline.map((phase, i) => {
                const Icon = getIcon(phase.icon)
                const isLast = i === pipeline.length - 1
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-full border"
                        style={{ borderColor: 'rgba(255,255,255,0.25)' }}
                      >
                        {Icon && <Icon size={22} strokeWidth={1.2} className="text-white" />}
                      </div>
                      <span className="mt-1.5 text-center font-display text-xs text-white/80">
                        {phase.label}
                      </span>
                    </div>
                    {!isLast && (
                      <div className="mb-5 h-[2px] w-6 rounded-full bg-white/20" />
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {steps && (
            <div className="mt-12 grid grid-cols-3 gap-6 lg:hidden">
              {steps.map((step, i) => {
                const Icon = getIcon(step.icon)
                return (
                  <div key={i} className="flex flex-col items-center text-center">
                    <div
                      className="flex h-[72px] w-[72px] items-center justify-center rounded-full border"
                      style={{
                        borderColor: useLightText
                          ? 'rgba(255,255,255,0.25)'
                          : 'rgba(0,0,0,0.15)',
                      }}
                    >
                      {Icon && (
                        <Icon
                          size={28}
                          strokeWidth={1}
                          className={useLightText ? 'text-white' : 'text-text-primary'}
                        />
                      )}
                    </div>
                    <h3
                      className={`mt-3 font-display text-sm font-normal ${
                        useLightText ? 'text-white' : 'text-text-primary'
                      }`}
                    >
                      {step.title}
                    </h3>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile image (below text) ── */}
      {image && !steps && (
        <motion.div
          className="relative lg:hidden aspect-[4/3] w-full"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7 }}
        >
          <ImageWithFallback
            src={image.src}
            alt={image.alt || ''}
            fill
            className="object-cover"
            sizes="100vw"
            label={image.alt || ''}
          />
        </motion.div>
      )}
    </div>
  )
}
