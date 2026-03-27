'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import { InlineMarkdown } from '@/components/ui/InlineMarkdown'

interface StoryBlock {
  type?: 'text' | 'quote'
  headline?: string
  body?: string
  quote?: string
}

interface ParallaxStorySlideProps {
  image: { src: string; alt: string }
  sections: StoryBlock[]
  signature?: string
}

export function ParallaxStorySlide({ image, sections, signature }: ParallaxStorySlideProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '-15%'])

  return (
    <div ref={containerRef} className="relative">
      {/* Fixed background image */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ y: bgY }}
        >
          <div
            className="absolute inset-0 bg-cover bg-[center_20%]"
            style={{
              backgroundImage: `url(${image.src})`,
              top: '-15%',
              bottom: '-15%',
              height: '130%',
            }}
          />
        </motion.div>
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Scrolling text sections – centered */}
      <div className="relative z-10" style={{ marginTop: '-100vh' }}>
        <div className="h-[25vh]" />

        {sections.map((section, i) => {
          const isQuote = section.type === 'quote' || !!section.quote

          if (isQuote) {
            return (
              <div key={i} className="flex justify-center py-4 lg:py-6">
                <div className="w-full max-w-2xl px-8">
                  <motion.blockquote
                    className="border-l-[3px] border-[#F44900] pl-6 lg:pl-8"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-15%' }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  >
                    <p className="font-display text-[1.25rem] font-normal italic leading-[1.4] text-white/90 md:text-[1.5rem] lg:text-[1.75rem]">
                      {section.quote || section.body}
                    </p>
                  </motion.blockquote>
                </div>
              </div>
            )
          }

          return (
            <div key={i} className={`flex justify-center py-3 lg:py-5 ${i === 0 ? 'pt-0' : ''}`}>
              <div className="w-full max-w-2xl px-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-15%' }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                >
                  {section.headline && (
                    <h3 className="font-display text-[2rem] font-normal leading-[1.15] text-white md:text-[2.75rem] lg:text-[3.5rem]">
                      {section.headline}
                    </h3>
                  )}
                  {section.body && (
                    <p className={`font-body text-base leading-relaxed text-white/80 lg:text-lg ${section.headline ? 'mt-4' : ''}`}>
                      <InlineMarkdown text={section.body} />
                    </p>
                  )}
                </motion.div>
              </div>
            </div>
          )
        })}

        {/* Signature – centered */}
        {signature && (
          <div className="flex justify-center pt-8 pb-4 lg:pt-12 lg:pb-6">
            <div className="w-full max-w-2xl px-8">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-15%' }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                <Image
                  src={signature}
                  alt="Unterschrift"
                  width={200}
                  height={80}
                  className="brightness-0 invert opacity-80"
                />
              </motion.div>
            </div>
          </div>
        )}

        <div className="h-[15vh]" />
      </div>
    </div>
  )
}
