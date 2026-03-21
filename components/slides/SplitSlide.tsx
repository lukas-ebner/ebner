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
      <h2 className="font-display text-h2 font-normal text-text-primary">{headline}</h2>
      <p className="mt-4 font-body text-body leading-relaxed text-text-dimmed">{body}</p>
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
    <div className="relative h-[300px] w-full overflow-hidden rounded-lg md:h-[400px] lg:h-[500px]">
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
