'use client'

import { useEffect, useState } from 'react'

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

export function useCountUp(
  target: number,
  durationMs: number,
  enabled: boolean,
): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!enabled || target <= 0) return

    let frame: number
    const start = performance.now()

    function tick(now: number) {
      const elapsed = now - start
      const t = Math.min(1, elapsed / durationMs)
      const eased = easeOutCubic(t)
      setValue(Math.round(eased * target))
      if (t < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, durationMs, enabled])

  if (!enabled) return 0
  if (target <= 0) return 0
  return value
}
