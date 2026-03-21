'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface SlideContainerProps {
  children: React.ReactNode
  index: number
}

export function SlideContainer({ children }: SlideContainerProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
    >
      {children}
    </motion.section>
  )
}
