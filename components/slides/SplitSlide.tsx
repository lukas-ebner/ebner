import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { Button } from '@/components/ui/Button'
import type { CtaConfig, ImageConfig } from '@/lib/types'

interface SplitSlideProps {
  direction: 'left' | 'right'
  headline: string
  body: string
  cta?: CtaConfig
  image: ImageConfig
  variant?: 'light' | 'dark'
  imageStyle?: 'rounded' | 'full-bleed'
  size?: 'balanced' | 'image-heavy'
  pill?: string
  fullHeight?: boolean
  slideIndex?: number
}

export function SplitSlide({
  direction,
  headline,
  body,
  cta,
  image,
  variant = 'light',
  imageStyle = 'rounded',
  size = 'balanced',
  pill,
  fullHeight = false,
  slideIndex = 1,
}: SplitSlideProps) {
  const isDark = variant === 'dark'
  const paragraphs = body.split(/\n\n+/).filter((p) => p.trim().length > 0)

  const sectionBg = isDark ? 'bg-surface-dark' : 'bg-surface-light'
  const headlineClass = isDark ? 'text-text-light' : 'text-text-primary'
  const bodyClass = isDark ? 'text-text-light/70' : 'text-text-dimmed'
  const pillClass = isDark
    ? 'border-text-light/20 text-text-light/60'
    : 'border-brand/30 text-brand'

  const gridCols =
    size === 'image-heavy'
      ? direction === 'left'
        ? 'lg:grid-cols-[2fr_3fr]'
        : 'lg:grid-cols-[3fr_2fr]'
      : 'lg:grid-cols-2'

  const imageRounded = imageStyle === 'rounded' ? 'rounded-lg' : ''
  const imageMinH = fullHeight
    ? 'min-h-[320px] md:min-h-[420px] lg:min-h-[600px]'
    : size === 'image-heavy'
      ? 'min-h-[320px] md:min-h-[420px] lg:min-h-[520px]'
      : 'min-h-[300px] md:min-h-[400px] lg:min-h-[500px]'

  const sectionMinH = fullHeight ? 'min-h-[80vh]' : 'min-h-0'

  const textBlock = (
    <div className="flex min-h-0 flex-col justify-center p-12 lg:p-24">
      {pill ? (
        <span
          className={`mb-4 inline-block w-fit rounded-full border px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest ${pillClass}`}
        >
          {pill}
        </span>
      ) : null}
      {slideIndex === 0 ? (
        <h1 className={`font-display text-h2 font-normal ${headlineClass}`}>{headline}</h1>
      ) : (
        <h2 className={`font-display text-h2 font-normal ${headlineClass}`}>{headline}</h2>
      )}
      <div className="mt-4 space-y-4">
        {paragraphs.map((paragraph, i) => (
          <p
            key={i}
            className={`font-body text-body leading-relaxed ${bodyClass}`}
          >
            {paragraph.trim()}
          </p>
        ))}
      </div>
      {cta ? (
        <div className="mt-8">
          <Button href={cta.url} variant={isDark ? 'primary' : 'outline'}>
            {cta.text}
          </Button>
        </div>
      ) : null}
    </div>
  )

  const imageBlock = (
    <div
      className={`relative w-full overflow-hidden ${imageMinH} ${imageRounded} ${
        imageStyle === 'full-bleed' ? 'lg:h-full lg:min-h-0' : ''
      }`}
    >
      <ImageWithFallback
        src={image.src}
        alt={image.alt ?? ''}
        fill
        className="object-cover object-center"
        sizes="(max-width: 768px) 100vw, 50vw"
        label="Slide-Bild"
      />
    </div>
  )

  return (
    <div className={`grid grid-cols-1 items-stretch ${sectionBg} ${gridCols} ${sectionMinH}`}>
      {direction === 'left' ? (
        <>
          {textBlock}
          {imageBlock}
        </>
      ) : (
        <>
          {imageBlock}
          {textBlock}
        </>
      )}
    </div>
  )
}
