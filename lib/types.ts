export interface SlideConfig {
  template: string
  [key: string]: unknown
}

export interface PageMeta {
  title: string
  description: string
  og_image?: string
  accent?: string
  noSnap?: boolean
}

export interface PageConfig {
  meta: PageMeta
  slides: SlideConfig[]
}

export interface CtaConfig {
  text: string
  url: string
}

/* ── Blog ── */
export interface BlogPostMeta {
  title: string
  slug: string
  description: string
  keyword: string
  nebenkeywords?: string[]
  category: 'operations' | 'systeme' | 'ki' | 'exit'
  status: 'draft' | 'review' | 'published'
  funnel: 'TOFU' | 'MOFU' | 'BOFU'
  kd: string
  date: string
  image?: string
  cta?: CtaConfig
}

export interface BlogPost {
  meta: BlogPostMeta
  content: string
}

export interface ImageConfig {
  src: string
  alt: string
  opacity?: number
  height?: string
  position?: string
  mobilePosition?: string
}
