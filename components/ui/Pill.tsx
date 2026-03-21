import type { ReactNode } from 'react'

interface PillProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'dark'
}

export function Pill({ children, className = '', variant = 'default' }: PillProps) {
  const styles =
    variant === 'dark'
      ? 'border border-border-dark bg-white/5 text-text-muted'
      : 'bg-teal-light text-teal'

  return (
    <span
      className={`inline-flex items-center rounded-pill px-3 py-1 font-mono text-pill uppercase tracking-widest ${styles} ${className}`}
    >
      {children}
    </span>
  )
}
