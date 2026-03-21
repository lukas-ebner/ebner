'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ImageWithFallbackProps {
  src: string
  alt: string
  fill?: boolean
  className?: string
  sizes?: string
  priority?: boolean
  label?: string
}

export function ImageWithFallback({
  src,
  alt,
  fill,
  className,
  sizes,
  priority,
  label,
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-border text-text-muted ${
          fill ? 'absolute inset-0 min-h-[12rem]' : ''
        } ${className ?? ''}`}
        aria-label={alt || 'Platzhalter'}
      >
        <span className="font-mono text-pill uppercase tracking-widest">
          {label ?? 'Bild fehlt'}
        </span>
        <span className="mt-1 max-w-[90%] truncate px-2 text-center text-xs opacity-70">{src}</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
    />
  )
}
