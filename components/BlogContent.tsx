'use client'

interface BlogContentProps {
  content: string
}

/** Simple markdown-to-HTML renderer for blog articles.
 *  Handles: h1-h3, paragraphs, bold, italic, lists, blockquotes, hr, links.
 *  For production, swap with MDX or remark/rehype pipeline. */
export function BlogContent({ content }: BlogContentProps) {
  const html = markdownToHtml(content)
  return (
    <div
      className="prose prose-lg max-w-none
        prose-headings:font-display prose-headings:font-normal prose-headings:text-text-primary
        prose-h2:mt-12 prose-h2:text-[1.6rem]
        prose-h3:mt-8 prose-h3:text-[1.25rem]
        prose-p:font-body prose-p:leading-relaxed prose-p:text-text-secondary
        prose-li:font-body prose-li:text-text-secondary
        prose-strong:text-text-primary
        prose-blockquote:border-brand prose-blockquote:font-body prose-blockquote:text-text-muted
        prose-a:text-brand prose-a:no-underline hover:prose-a:underline"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function markdownToHtml(md: string): string {
  const lines = md.split('\n')
  const out: string[] = []
  let inList = false
  let inBlockquote = false

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    // blank line
    if (line.trim() === '') {
      if (inList) { out.push('</ul>'); inList = false }
      if (inBlockquote) { out.push('</blockquote>'); inBlockquote = false }
      continue
    }

    // headings
    if (line.startsWith('### ')) {
      if (inList) { out.push('</ul>'); inList = false }
      out.push(`<h3>${inline(line.slice(4))}</h3>`)
      continue
    }
    if (line.startsWith('## ')) {
      if (inList) { out.push('</ul>'); inList = false }
      out.push(`<h2>${inline(line.slice(3))}</h2>`)
      continue
    }
    if (line.startsWith('# ')) {
      if (inList) { out.push('</ul>'); inList = false }
      out.push(`<h1>${inline(line.slice(2))}</h1>`)
      continue
    }

    // hr
    if (/^---+$/.test(line.trim())) {
      out.push('<hr />')
      continue
    }

    // blockquote
    if (line.startsWith('> ')) {
      if (!inBlockquote) { out.push('<blockquote>'); inBlockquote = true }
      out.push(`<p>${inline(line.slice(2))}</p>`)
      continue
    }

    // unordered list
    if (/^[-*] /.test(line.trim())) {
      if (!inList) { out.push('<ul>'); inList = true }
      out.push(`<li>${inline(line.replace(/^\s*[-*] /, ''))}</li>`)
      continue
    }

    // ordered list
    if (/^\d+\.\s/.test(line.trim())) {
      if (!inList) { out.push('<ul>'); inList = true }
      out.push(`<li>${inline(line.replace(/^\s*\d+\.\s/, ''))}</li>`)
      continue
    }

    // paragraph
    if (inList) { out.push('</ul>'); inList = false }
    out.push(`<p>${inline(line)}</p>`)
  }

  if (inList) out.push('</ul>')
  if (inBlockquote) out.push('</blockquote>')

  return out.join('\n')
}

function inline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
}
