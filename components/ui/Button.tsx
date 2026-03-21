import Link from 'next/link'
import type { ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'link'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-white hover:bg-brand/90 rounded-button px-8 py-4 font-display font-bold transition-colors',
  secondary:
    'bg-surface-dark text-text-light hover:bg-surface-dark/90 rounded-button px-8 py-4 font-display font-semibold transition-colors',
  ghost:
    'rounded-button px-6 py-3 font-display text-text-primary hover:bg-black/5 transition-colors',
  outline:
    'rounded-button border-2 border-border-dark px-8 py-4 font-display font-semibold text-text-primary hover:bg-surface-cool transition-colors',
  link: 'font-display font-semibold text-brand underline-offset-4 hover:underline',
}

interface ButtonProps {
  href?: string
  children: ReactNode
  variant?: ButtonVariant
  className?: string
  type?: 'button' | 'submit'
  onClick?: () => void
}

export function Button({
  href,
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  onClick,
}: ButtonProps) {
  const base = variantClasses[variant]
  const combined = `${base} inline-flex items-center justify-center text-body ${className}`

  if (href) {
    return (
      <Link href={href} className={combined}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={combined} onClick={onClick}>
      {children}
    </button>
  )
}
