'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface SlideContainerProps {
  children: React.ReactNode
  index: number
}

export function SlideContainer({ children, index }: SlideContainerProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const isHero = index === 0

  return (
    <motion.section
      ref={ref}
      className="snap-start"
      initial={isHero ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      animate={isHero ? { opacity: 1, y: 0 } : isInView ? { opacity: 1, y: 0 } : {}}
      transition={isHero ? { duration: 0 } : { duration: 0.6, ease: 'easeOut', delay: 0.1 }}
    >
      {children}
    </motion.section>
  )
}
