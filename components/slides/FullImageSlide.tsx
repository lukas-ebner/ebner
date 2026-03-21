import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import type { ImageConfig } from '@/lib/types'

interface FullImageSlideProps {
  image: ImageConfig & { height?: string }
}

export function FullImageSlide({ image }: FullImageSlideProps) {
  const height = image.height ?? '70vh'

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height }}
    >
      <ImageWithFallback
        src={image.src}
        alt={image.alt}
        fill
        className="object-cover"
        sizes="100vw"
        label="Full-Bleed"
      />
    </div>
  )
}
