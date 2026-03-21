'use client'

import type { SlideConfig } from '@/lib/types'
import { HeroSlide } from '@/components/slides/HeroSlide'
import { StatementSlide } from '@/components/slides/StatementSlide'
import { StatsSlide } from '@/components/slides/StatsSlide'
import { SplitSlide } from '@/components/slides/SplitSlide'
import { CTASlide } from '@/components/slides/CTASlide'
import { FullImageSlide } from '@/components/slides/FullImageSlide'
import { CardsGridSlide } from '@/components/slides/CardsGridSlide'
import { SlideContainer } from '@/components/layout/SlideContainer'

const SLIDE_REGISTRY: Record<string, React.ComponentType<Record<string, unknown>>> = {
  'hero-dark': HeroSlide as unknown as React.ComponentType<Record<string, unknown>>,
  statement: StatementSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'stats-dark': StatsSlide as unknown as React.ComponentType<Record<string, unknown>>,
  split: SplitSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'cta-dark': CTASlide as unknown as React.ComponentType<Record<string, unknown>>,
  'full-image': FullImageSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'cards-grid': CardsGridSlide as unknown as React.ComponentType<Record<string, unknown>>,
}

export function PageBuilder({ slides }: { slides: SlideConfig[] }) {
  return (
    <main>
      {slides.map((slide, i) => {
        const Component = SLIDE_REGISTRY[slide.template]
        if (!Component) {
          console.warn(`Unknown slide template: ${slide.template}`)
          return null
        }
        const props = { ...slide } as Record<string, unknown>
        delete props.template
        return (
          <SlideContainer key={i} index={i}>
            <Component {...props} />
          </SlideContainer>
        )
      })}
    </main>
  )
}
