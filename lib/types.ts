export interface SlideConfig {
  template: string
  [key: string]: unknown
}

export interface PageMeta {
  title: string
  description: string
  og_image?: string
}

export interface PageConfig {
  meta: PageMeta
  slides: SlideConfig[]
}

export interface CtaConfig {
  text: string
  url: string
}

export interface ImageConfig {
  src: string
  alt: string
  opacity?: number
  height?: string
}
