import Link from 'next/link'
import type { ReactNode } from 'react'
import { isDualPathSelectionHref, trackLeadtimeEvent } from '@/lib/leadtime-tracking'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'link'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'text-white rounded-md px-6 py-3 text-sm tracking-wide font-display font-normal transition-colors',
  secondary:
    'bg-surface-dark text-text-light hover:bg-surface-dark/90 rounded-md px-6 py-3 text-sm font-display font-normal transition-colors',
  ghost:
    'rounded-button px-6 py-3 font-display text-text-primary hover:bg-black/5 transition-colors',
  outline:
    'rounded-md border-2 border-border-dark px-6 py-3 text-sm font-display font-normal text-text-primary hover:bg-surface-cool transition-colors',
  link: 'font-display font-normal underline-offset-4 hover:underline',
}

/* All buttons use brand orange – no page-accent override */
const accentStyles: Partial<Record<ButtonVariant, React.CSSProperties>> = {
  primary: { backgroundColor: '#F44900' },
  link: { color: '#F44900' },
}

interface ButtonProps {
  href?: string
  children: ReactNode
  variant?: ButtonVariant
  className?: string
  type?: 'button' | 'submit'
  onClick?: () => void
}

function getButtonText(children: ReactNode): string {
  if (typeof children === 'string') return children
  if (typeof children === 'number') return String(children)
  return 'cta'
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
  const combined = `${base} inline-flex items-center justify-center ${variant === 'link' || variant === 'ghost' ? 'text-body' : ''} ${className}`
  const style = accentStyles[variant]

  if (href) {
    return (
      <Link
        href={href}
        className={combined}
        style={style}
        onClick={() => {
          trackLeadtimeEvent('lt_cta_clicked', {
            cta_text: getButtonText(children),
            click_target: href,
          }, { href })

          if (isDualPathSelectionHref(href)) {
            trackLeadtimeEvent(
              'lt_path_selected',
              { selected_href: href },
              { href }
            )
          }
          if (href.includes('/erstgespraech')) {
            trackLeadtimeEvent(
              'lt_trial_started',
              { trial_entry_href: href },
              { pathVariant: 'enterprise' }
            )
          }
          onClick?.()
        }}
      >
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={combined} style={style} onClick={onClick}>
      {children}
    </button>
  )
}
