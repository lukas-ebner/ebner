import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { Button } from '@/components/ui/Button'
import type { CtaConfig, ImageConfig } from '@/lib/types'

interface SplitSlideProps {
  direction: 'left' | 'right'
  headline: string
  body: string
  cta?: CtaConfig
  image: ImageConfig
}

export function SplitSlide({
  direction,
  headline,
  body,
  cta,
  image,
}: SplitSlideProps) {
  const textBlock = (
    <div className="flex flex-col justify-center p-12 lg:p-24">
      <h2 className="font-display text-h2 font-bold text-text-primary">{headline}</h2>
      <p className="mt-4 font-body text-body text-text-primary">{body}</p>
      {cta ? (
        <div className="mt-8">
          <Button href={cta.url} variant="outline">
            {cta.text}
          </Button>
        </div>
      ) : null}
    </div>
  )

  const imageBlock = (
    <div className="relative min-h-[280px] overflow-hidden lg:min-h-0">
      <ImageWithFallback
        src={image.src}
        alt={image.alt}
        fill
        className="object-cover lg:rounded-card"
        sizes="(min-width: 1024px) 50vw, 100vw"
        label="Slide-Bild"
      />
    </div>
  )

  return (
    <div className="grid grid-cols-1 bg-surface-light lg:grid-cols-2">
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
