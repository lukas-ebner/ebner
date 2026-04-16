'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import type { SlideConfig } from '@/lib/types'
import { HeroSlide } from '@/components/slides/HeroSlide'
import { StatementSlide } from '@/components/slides/StatementSlide'
import { StatsSlide } from '@/components/slides/StatsSlide'
import { SplitSlide } from '@/components/slides/SplitSlide'
import { CTASlide } from '@/components/slides/CTASlide'
import { FullImageSlide } from '@/components/slides/FullImageSlide'
import { CardsGridSlide } from '@/components/slides/CardsGridSlide'
import { HeroSplitSlide } from '@/components/slides/HeroSplitSlide'
import { StepsSlide } from '@/components/slides/StepsSlide'
import { ImageOverlaySlide } from '@/components/slides/ImageOverlaySlide'
import { QuoteSlide } from '@/components/slides/QuoteSlide'
import { FeatureListSlide } from '@/components/slides/FeatureListSlide'
import { ParallaxImageSlide } from '@/components/slides/ParallaxImageSlide'
import { StatsOverlaySlide } from '@/components/slides/StatsOverlaySlide'
import { TimelineSlide } from '@/components/slides/TimelineSlide'
import { PhotoGallerySlide } from '@/components/slides/PhotoGallerySlide'
import { ContactFormSlide } from '@/components/slides/ContactFormSlide'
import { TextBlockSlide } from '@/components/slides/TextBlockSlide'
import { ProblemSlide } from '@/components/slides/ProblemSlide'
import { CredibilitySlide } from '@/components/slides/CredibilitySlide'
import { IconCirclesSlide } from '@/components/slides/IconCirclesSlide'
import { NumberedFeaturesSlide } from '@/components/slides/NumberedFeaturesSlide'
import { PricingTableSlide } from '@/components/slides/PricingTableSlide'
import { PricingTeaserSlide } from '@/components/slides/PricingTeaserSlide'
import { FAQSlide } from '@/components/slides/FAQSlide'
import { QualificationSlide } from '@/components/slides/QualificationSlide'
import { ApplicationFormSlide } from '@/components/slides/ApplicationFormSlide'
import { LegalSlide } from '@/components/slides/LegalSlide'
import { TextImageSlide } from '@/components/slides/TextImageSlide'
import { ToolCloudSlide } from '@/components/slides/ToolCloudSlide'
import { SymptomsGridSlide } from '@/components/slides/SymptomsGridSlide'
import { KiReadinessChatSlide } from '@/components/slides/KiReadinessChatSlide'
import { PricingCalculatorSlide } from '@/components/slides/PricingCalculatorSlide'
import { BafaCalculatorSlide } from '@/components/slides/BafaCalculatorSlide'
import { ProjectNavSlide } from '@/components/slides/ProjectNavSlide'
import { ProjectSectionSlide } from '@/components/slides/ProjectSectionSlide'
import { ProjectsHeroSlide } from '@/components/slides/ProjectsHeroSlide'
import { ProjectDetailSlide } from '@/components/slides/ProjectDetailSlide'
import { ParallaxStorySlide } from '@/components/slides/ParallaxStorySlide'
import { CertificatesSlide } from '@/components/slides/CertificatesSlide'
import { BlogTeaserSlide } from '@/components/slides/BlogTeaserSlide'
import { ProfileSummarySlide } from '@/components/slides/ProfileSummarySlide'
import { FreiheitstestSlide } from '@/components/slides/FreiheitstestSlide'
import { ThreePillarsSlide } from '@/components/slides/ThreePillarsSlide'
import { PillarDetailSlide } from '@/components/slides/PillarDetailSlide'
import { EbookLeadmagnetSlide } from '@/components/slides/EbookLeadmagnetSlide'
import { SlideContainer } from '@/components/layout/SlideContainer'
import { QuizProvider } from '@/components/QuizContext'
import { NoSnap } from '@/components/NoSnap'
import { trackLeadtimeEvent } from '@/lib/leadtime-tracking'

const SLIDE_REGISTRY: Record<string, React.ComponentType<Record<string, unknown>>> = {
  'hero-dark': HeroSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'hero-split': HeroSplitSlide as unknown as React.ComponentType<Record<string, unknown>>,
  statement: StatementSlide as unknown as React.ComponentType<Record<string, unknown>>,
  stats: StatsSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'stats-dark': StatsSlide as unknown as React.ComponentType<Record<string, unknown>>,
  split: SplitSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'cta-dark': CTASlide as unknown as React.ComponentType<Record<string, unknown>>,
  'full-image': FullImageSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'cards-grid': CardsGridSlide as unknown as React.ComponentType<Record<string, unknown>>,
  steps: StepsSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'image-overlay': ImageOverlaySlide as unknown as React.ComponentType<Record<string, unknown>>,
  quote: QuoteSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'feature-list': FeatureListSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'parallax-image': ParallaxImageSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'stats-overlay': StatsOverlaySlide as unknown as React.ComponentType<Record<string, unknown>>,
  timeline: TimelineSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'photo-gallery': PhotoGallerySlide as unknown as React.ComponentType<Record<string, unknown>>,
  'contact-form': ContactFormSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'text-block': TextBlockSlide as unknown as React.ComponentType<Record<string, unknown>>,
  problem: ProblemSlide as unknown as React.ComponentType<Record<string, unknown>>,
  credibility: CredibilitySlide as unknown as React.ComponentType<Record<string, unknown>>,
  'icon-circles': IconCirclesSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'numbered-features': NumberedFeaturesSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'pricing-table': PricingTableSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'pricing-teaser': PricingTeaserSlide as unknown as React.ComponentType<Record<string, unknown>>,
  faq: FAQSlide as unknown as React.ComponentType<Record<string, unknown>>,
  qualification: QualificationSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'application-form': ApplicationFormSlide as unknown as React.ComponentType<Record<string, unknown>>,
  legal: LegalSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'text-image': TextImageSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'tool-cloud': ToolCloudSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'symptoms-grid': SymptomsGridSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'pricing-calculator': PricingCalculatorSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'bafa-calculator': BafaCalculatorSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'ki-readiness-chat': KiReadinessChatSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'project-nav': ProjectNavSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'project-section': ProjectSectionSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'projects-hero': ProjectsHeroSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'project-detail': ProjectDetailSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'parallax-story': ParallaxStorySlide as unknown as React.ComponentType<Record<string, unknown>>,
  certificates: CertificatesSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'blog-teaser': BlogTeaserSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'profile-summary': ProfileSummarySlide as unknown as React.ComponentType<Record<string, unknown>>,
  'freiheitstest': FreiheitstestSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'three-pillars': ThreePillarsSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'pillar-detail': PillarDetailSlide as unknown as React.ComponentType<Record<string, unknown>>,
  'ebook-leadmagnet': EbookLeadmagnetSlide as unknown as React.ComponentType<Record<string, unknown>>,
}

export function PageBuilder({ slides, accent, noSnap }: { slides: SlideConfig[]; accent?: string; noSnap?: boolean }) {
  const pathname = usePathname()
  const paywallTrackedRef = useRef(false)

  useEffect(() => {
    if (pathname !== '/preise' || paywallTrackedRef.current) return
    paywallTrackedRef.current = true
    trackLeadtimeEvent(
      'lt_paywall_impression',
      { paywall_surface: 'preise_page' },
      { pathVariant: 'self_serve' }
    )
  }, [pathname])

  return (
    <QuizProvider>
      <main style={accent ? { '--accent': accent } as React.CSSProperties : undefined}>
        {noSnap && <NoSnap />}
        {slides.map((slide, i) => {
          const Component = SLIDE_REGISTRY[slide.template]
          if (!Component) {
            console.warn(`Unknown slide template: ${slide.template}`)
            return null
          }
          const props = { ...slide, slideIndex: i } as Record<string, unknown>
          delete props.template
          return (
            <SlideContainer key={i} index={i}>
              <Component {...props} />
            </SlideContainer>
          )
        })}
      </main>
    </QuizProvider>
  )
}
