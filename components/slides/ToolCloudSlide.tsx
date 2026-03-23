'use client'

/* eslint-disable @next/next/no-img-element */
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect, useCallback } from 'react'

interface Person {
  image: string
  quote: string
}

interface Tool {
  src: string
}

interface ToolCloudSlideProps {
  headline?: string
  cloudImage: string
  tools: Tool[]
  people: Person[]
  variant?: 'light' | 'dark'
}

/* ── Tool positions inside the cloud (% of cloud area) — compact, centered ── */
const TOOL_POSITIONS = [
  { x: 32, y: 20 },
  { x: 44, y: 14 },
  { x: 56, y: 20 },
  { x: 67, y: 14 },
  { x: 74, y: 24 },
  { x: 28, y: 38 },
  { x: 40, y: 34 },
  { x: 52, y: 40 },
  { x: 64, y: 34 },
  { x: 74, y: 42 },
  { x: 34, y: 56 },
  { x: 48, y: 58 },
  { x: 62, y: 54 },
]

/* ── Float variants for organic movement ── */
const FLOAT_VARIANTS = [
  { y: [0, -5, 3, -4, 0], x: [0, 3, -2, 3, 0], dur: 7 },
  { y: [0, -3, 4, -6, 0], x: [0, -2, 3, -2, 0], dur: 8.5 },
  { y: [0, 4, -3, 5, 0], x: [0, 3, -3, 2, 0], dur: 6.5 },
  { y: [0, -6, 2, -3, 0], x: [0, -2, 4, -3, 0], dur: 7.5 },
  { y: [0, 3, -5, 2, 0], x: [0, 2, -3, 2, 0], dur: 6 },
]

/* ── People layout ──
   x/y = portrait center (% of 16:9 container)
   side = where the quote text appears relative to portrait
*/
const PEOPLE_LAYOUTS: {
  x: number
  y: number
  side: 'left' | 'right'
}[] = [
  { x: 14, y: 12, side: 'right' },   // top-left — pushed further left
  { x: 86, y: 10, side: 'left' },    // top-right — pushed further right
  { x: 6, y: 48, side: 'right' },    // mid-left
  { x: 94, y: 46, side: 'left' },    // mid-right
  { x: 14, y: 84, side: 'right' },   // bottom-left
  { x: 86, y: 82, side: 'left' },    // bottom-right
]

const PORTRAIT_SIZE = 110
const AUTO_CYCLE_MS = 3500

export function ToolCloudSlide({
  headline,
  cloudImage,
  tools,
  people,
  variant = 'dark',
}: ToolCloudSlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [activePerson, setActivePerson] = useState<number | null>(null)
  const [isHovering, setIsHovering] = useState(false)

  const isDark = variant === 'dark'
  const bgClass = isDark ? 'bg-surface-dark' : 'bg-white'
  const headlineColor = isDark ? 'text-white' : 'text-text-primary'
  const quoteColor = isDark ? 'text-white' : 'text-text-primary'
  const mobileCardBg = isDark ? 'bg-white/[0.06]' : 'bg-surface-light'
  const mobileQuoteColor = isDark ? 'text-white/80' : 'text-text-secondary'

  /* ── Auto-cycle quotes ── */
  const cycleRef = useRef(0)
  const advanceCycle = useCallback(() => {
    cycleRef.current = (cycleRef.current + 1) % people.length
    setActivePerson(cycleRef.current)
  }, [people.length])

  useEffect(() => {
    if (!isInView) return
    const t = setTimeout(() => {
      if (!isHovering) setActivePerson(0)
    }, 1400)
    return () => clearTimeout(t)
  }, [isInView, isHovering])

  useEffect(() => {
    if (!isInView || isHovering) return
    const iv = setInterval(advanceCycle, AUTO_CYCLE_MS)
    return () => clearInterval(iv)
  }, [isInView, isHovering, advanceCycle])

  const onEnter = (i: number) => {
    setIsHovering(true)
    setActivePerson(i)
    cycleRef.current = i
  }
  const onLeave = () => setIsHovering(false)

  return (
    <section ref={ref} className={bgClass}>
      <div
        className={`mx-auto max-w-[1600px] px-8 ${
          headline ? 'py-24 lg:py-32' : 'pb-8 pt-16 lg:pb-12 lg:pt-24'
        }`}
      >
        {headline && (
          <motion.h2
            className={`mb-12 text-center font-display text-[2.25rem] font-normal leading-[1.1] ${headlineColor} md:text-[3rem] lg:mb-16 lg:text-[4rem]`}
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            {headline}
          </motion.h2>
        )}

        {/* ════════════════════════════════════
            DESKTOP
           ════════════════════════════════════ */}
        <motion.div
          className="relative mx-auto hidden lg:block"
          style={{ aspectRatio: '16 / 9', maxWidth: '1200px' }}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Cloud SVG — use CSS filter to make it visible as light grey */}
          <div className="absolute inset-[5%_10%]">
            <img
              src={cloudImage}
              alt=""
              className="h-full w-full object-contain"
              style={{
                opacity: 1,
                filter: 'brightness(0.92) saturate(0.3)',
              }}
            />
          </div>

          {/* Floating tool icons */}
          {tools.map((tool, i) => {
            const pos = TOOL_POSITIONS[i % TOOL_POSITIONS.length]
            const anim = FLOAT_VARIANTS[i % FLOAT_VARIANTS.length]
            return (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  width: 68,
                  height: 68,
                }}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={
                  isInView
                    ? { opacity: 1, scale: 1, y: anim.y, x: anim.x }
                    : {}
                }
                transition={{
                  opacity: { duration: 0.5, delay: 0.5 + i * 0.07 },
                  scale: { duration: 0.5, delay: 0.5 + i * 0.07 },
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
                <img src={tool.src} alt="" className="h-full w-full" />
              </motion.div>
            )
          })}

          {/* ── People with speech bubbles (flex layout, no pixel offsets) ── */}
          {people.map((person, i) => {
            const l = PEOPLE_LAYOUTS[i % PEOPLE_LAYOUTS.length]
            const isActive = activePerson === i
            const isLeft = l.side === 'left'

            return (
              <div
                key={i}
                className="absolute"
                style={{
                  left: `${l.x}%`,
                  top: `${l.y}%`,
                  /* Anchor on the portrait center */
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Flex container: portrait + quote side by side */}
                <div
                  className={`flex items-center gap-5 ${
                    isLeft ? 'flex-row-reverse' : 'flex-row'
                  }`}
                  /* Shift so the portrait stays at the anchor point.
                     With flex-row-reverse (left), the portrait is on the right end,
                     so we shift right. With flex-row (right), portrait is on the left,
                     so no shift needed beyond centering the portrait. */
                  style={{
                    marginLeft: isLeft ? PORTRAIT_SIZE / 2 : -PORTRAIT_SIZE / 2,
                  }}
                >
                  {/* Portrait */}
                  <motion.div
                    className="relative z-10 shrink-0 cursor-pointer"
                    style={{
                      width: PORTRAIT_SIZE,
                      height: PORTRAIT_SIZE,
                    }}
                    onMouseEnter={() => onEnter(i)}
                    onMouseLeave={onLeave}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <img
                      src={person.image}
                      alt=""
                      className="h-full w-full drop-shadow-lg"
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{
                        boxShadow: isActive
                          ? '0 0 20px 4px rgba(13,79,84,0.2)'
                          : '0 0 0 0 rgba(13,79,84,0)',
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>

                  {/* Speech bubble — flex sibling, never overlaps portrait */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        className="w-[210px] shrink-0"
                        initial={{ opacity: 0, x: isLeft ? 10 : -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isLeft ? 10 : -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p
                          className={`font-body text-[14px] leading-relaxed ${quoteColor}`}
                          style={{
                            textAlign: isLeft ? 'right' : 'left',
                          }}
                        >
                          {person.quote}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )
          })}
        </motion.div>

        {/* ════════════════════════════════════
            MOBILE
           ════════════════════════════════════ */}
        <div className="lg:hidden">
          <div
            className="relative mx-auto mb-10"
            style={{ aspectRatio: '4 / 3', maxWidth: '420px' }}
          >
            <div className="absolute inset-0">
              <img
                src={cloudImage}
                alt=""
                className="h-full w-full object-contain"
                style={{ filter: 'brightness(0.92) saturate(0.3)' }}
              />
            </div>
            {tools.slice(0, 9).map((tool, i) => {
              const pos = TOOL_POSITIONS[i]
              const anim = FLOAT_VARIANTS[i % FLOAT_VARIANTS.length]
              return (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y + 10}%`,
                    width: 44,
                    height: 44,
                  }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={
                    isInView
                      ? {
                          opacity: 1,
                          scale: 1,
                          y: anim.y.map((v) => v * 0.6),
                          x: anim.x.map((v) => v * 0.6),
                        }
                      : {}
                  }
                  transition={{
                    opacity: { duration: 0.4, delay: 0.3 + i * 0.07 },
                    scale: { duration: 0.4, delay: 0.3 + i * 0.07 },
                    y: {
                      duration: anim.dur,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.25,
                    },
                    x: {
                      duration: anim.dur,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.25,
                    },
                  }}
                >
                  <img src={tool.src} alt="" className="h-full w-full" />
                </motion.div>
              )
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {people.map((person, i) => (
              <motion.div
                key={i}
                className={`flex items-start gap-3 rounded-lg ${mobileCardBg} px-4 py-3`}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 + i * 0.08 }}
              >
                <div className="shrink-0" style={{ width: 44, height: 44 }}>
                  <img
                    src={person.image}
                    alt=""
                    className="h-full w-full rounded-full"
                  />
                </div>
                <p
                  className={`font-body text-sm leading-relaxed ${mobileQuoteColor}`}
                >
                  {person.quote}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
