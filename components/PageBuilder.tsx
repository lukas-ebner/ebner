'use client'

import dynamic from 'next/dynamic'
import type { SlideConfig } from '@/lib/types'
import { SlideContainer } from '@/components/layout/SlideContainer'
import { QuizProvider } from '@/components/QuizContext'
import { NoSnap } from '@/components/NoSnap'
import { PaywallTracker } from '@/components/PaywallTracker'

// Each slide type is its own chunk, so a page only loads the slide code it renders.
const HeroSlide = dynamic(() => import('@/components/slides/HeroSlide').then((mod) => mod.HeroSlide))
const StatementSlide = dynamic(() => import('@/components/slides/StatementSlide').then((mod) => mod.StatementSlide))
const StatsSlide = dynamic(() => import('@/components/slides/StatsSlide').then((mod) => mod.StatsSlide))
const SplitSlide = dynamic(() => import('@/components/slides/SplitSlide').then((mod) => mod.SplitSlide))
const CTASlide = dynamic(() => import('@/components/slides/CTASlide').then((mod) => mod.CTASlide))
const FullImageSlide = dynamic(() => import('@/components/slides/FullImageSlide').then((mod) => mod.FullImageSlide))
const CardsGridSlide = dynamic(() => import('@/components/slides/CardsGridSlide').then((mod) => mod.CardsGridSlide))
const HeroSplitSlide = dynamic(() => import('@/components/slides/HeroSplitSlide').then((mod) => mod.HeroSplitSlide))
const StepsSlide = dynamic(() => import('@/components/slides/StepsSlide').then((mod) => mod.StepsSlide))
const ImageOverlaySlide = dynamic(() => import('@/components/slides/ImageOverlaySlide').then((mod) => mod.ImageOverlaySlide))
const QuoteSlide = dynamic(() => import('@/components/slides/QuoteSlide').then((mod) => mod.QuoteSlide))
const FeatureListSlide = dynamic(() => import('@/components/slides/FeatureListSlide').then((mod) => mod.FeatureListSlide))
const ParallaxImageSlide = dynamic(() => import('@/components/slides/ParallaxImageSlide').then((mod) => mod.ParallaxImageSlide))
const StatsOverlaySlide = dynamic(() => import('@/components/slides/StatsOverlaySlide').then((mod) => mod.StatsOverlaySlide))
const TimelineSlide = dynamic(() => import('@/components/slides/TimelineSlide').then((mod) => mod.TimelineSlide))
const PhotoGallerySlide = dynamic(() => import('@/components/slides/PhotoGallerySlide').then((mod) => mod.PhotoGallerySlide))
const ContactFormSlide = dynamic(() => import('@/components/slides/ContactFormSlide').then((mod) => mod.ContactFormSlide))
const TextBlockSlide = dynamic(() => import('@/components/slides/TextBlockSlide').then((mod) => mod.TextBlockSlide))
const ProblemSlide = dynamic(() => import('@/components/slides/ProblemSlide').then((mod) => mod.ProblemSlide))
const CredibilitySlide = dynamic(() => import('@/components/slides/CredibilitySlide').then((mod) => mod.CredibilitySlide))
const IconCirclesSlide = dynamic(() => import('@/components/slides/IconCirclesSlide').then((mod) => mod.IconCirclesSlide))
const NumberedFeaturesSlide = dynamic(() => import('@/components/slides/NumberedFeaturesSlide').then((mod) => mod.NumberedFeaturesSlide))
const PricingTableSlide = dynamic(() => import('@/components/slides/PricingTableSlide').then((mod) => mod.PricingTableSlide))
const PricingTeaserSlide = dynamic(() => import('@/components/slides/PricingTeaserSlide').then((mod) => mod.PricingTeaserSlide))
const FAQSlide = dynamic(() => import('@/components/slides/FAQSlide').then((mod) => mod.FAQSlide))
const QualificationSlide = dynamic(() => import('@/components/slides/QualificationSlide').then((mod) => mod.QualificationSlide))
const ApplicationFormSlide = dynamic(() => import('@/components/slides/ApplicationFormSlide').then((mod) => mod.ApplicationFormSlide))
const LegalSlide = dynamic(() => import('@/components/slides/LegalSlide').then((mod) => mod.LegalSlide))
const TextImageSlide = dynamic(() => import('@/components/slides/TextImageSlide').then((mod) => mod.TextImageSlide))
const ToolCloudSlide = dynamic(() => import('@/components/slides/ToolCloudSlide').then((mod) => mod.ToolCloudSlide))
const SymptomsGridSlide = dynamic(() => import('@/components/slides/SymptomsGridSlide').then((mod) => mod.SymptomsGridSlide))
const KiReadinessChatSlide = dynamic(() => import('@/components/slides/KiReadinessChatSlide').then((mod) => mod.KiReadinessChatSlide))
const PricingCalculatorSlide = dynamic(() => import('@/components/slides/PricingCalculatorSlide').then((mod) => mod.PricingCalculatorSlide))
const BafaCalculatorSlide = dynamic(() => import('@/components/slides/BafaCalculatorSlide').then((mod) => mod.BafaCalculatorSlide))
const ProjectNavSlide = dynamic(() => import('@/components/slides/ProjectNavSlide').then((mod) => mod.ProjectNavSlide))
const ProjectSectionSlide = dynamic(() => import('@/components/slides/ProjectSectionSlide').then((mod) => mod.ProjectSectionSlide))
const ProjectsHeroSlide = dynamic(() => import('@/components/slides/ProjectsHeroSlide').then((mod) => mod.ProjectsHeroSlide))
const ProjectDetailSlide = dynamic(() => import('@/components/slides/ProjectDetailSlide').then((mod) => mod.ProjectDetailSlide))
const ParallaxStorySlide = dynamic(() => import('@/components/slides/ParallaxStorySlide').then((mod) => mod.ParallaxStorySlide))
const CertificatesSlide = dynamic(() => import('@/components/slides/CertificatesSlide').then((mod) => mod.CertificatesSlide))
const BlogTeaserSlide = dynamic(() => import('@/components/slides/BlogTeaserSlide').then((mod) => mod.BlogTeaserSlide))
const ProfileSummarySlide = dynamic(() => import('@/components/slides/ProfileSummarySlide').then((mod) => mod.ProfileSummarySlide))
const FreiheitstestSlide = dynamic(() => import('@/components/slides/FreiheitstestSlide').then((mod) => mod.FreiheitstestSlide))
const ThreePillarsSlide = dynamic(() => import('@/components/slides/ThreePillarsSlide').then((mod) => mod.ThreePillarsSlide))
const PillarDetailSlide = dynamic(() => import('@/components/slides/PillarDetailSlide').then((mod) => mod.PillarDetailSlide))
const EbookLeadmagnetSlide = dynamic(() => import('@/components/slides/EbookLeadmagnetSlide').then((mod) => mod.EbookLeadmagnetSlide))

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
  return (
    <QuizProvider>
      <PaywallTracker />
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
