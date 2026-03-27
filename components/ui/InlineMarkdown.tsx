import Link from 'next/link'

/**
 * Renders a string with inline Markdown links [text](url) and **bold** as JSX.
 * Internal links (starting with /) use Next.js <Link>, external links use <a>.
 */
export function InlineMarkdown({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  // Match [link text](url) and **bold**
  const parts = text.split(/(\[.*?\]\(.*?\)|\*\*.*?\*\*)/)

  return (
    <span className={className}>
      {parts.map((part, i) => {
        // Markdown link
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/)
        if (linkMatch) {
          const [, linkText, href] = linkMatch
          const isInternal = href.startsWith('/')
          if (isInternal) {
            return (
              <Link
                key={i}
                href={href}
                className="text-brand underline decoration-brand/30 underline-offset-2 transition-colors hover:decoration-brand"
              >
                {linkText}
              </Link>
            )
          }
          return (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand underline decoration-brand/30 underline-offset-2 transition-colors hover:decoration-brand"
            >
              {linkText}
            </a>
          )
        }

        // Bold
        const boldMatch = part.match(/^\*\*(.*?)\*\*$/)
        if (boldMatch) {
          return (
            <strong key={i} className="font-semibold text-text-primary">
              {boldMatch[1]}
            </strong>
          )
        }

        // Plain text
        return <span key={i}>{part}</span>
      })}
    </span>
  )
}
