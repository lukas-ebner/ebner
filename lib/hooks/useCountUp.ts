'use client'

import { useEffect, useLayoutEffect, useState } from 'react'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

/**
 * Zählt von 0 auf `target` hoch, sobald `enabled` true wird.
 * Server-Render und erster Client-Render liefern den Endwert, damit Crawler
 * ohne JavaScript (Google, KI-Bots) die echten Zahlen lesen statt "0".
 * Vor dem ersten Paint springt der Wert per Layout-Effect auf 0 – kein Flackern.
 */
export function useCountUp(
  target: number,
  durationMs: number,
  enabled: boolean,
): number {
  const [mounted, setMounted] = useState(false)
  const [value, setValue] = useState(0)

  useIsomorphicLayoutEffect(() => {
    setMounted(true)
  }, [])

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

  if (!mounted) return target
  if (!enabled) return 0
  if (target <= 0) return 0
  return value
}
