import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { BlogPost, BlogPostMeta } from './types'

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

export function loadBlogPost(slug: string): BlogPost {
  const filePath = path.join(BLOG_DIR, `${slug}.md`)
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return {
    meta: { ...data, slug } as BlogPostMeta,
    content,
  }
}

export function listBlogPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const slug = f.replace(/\.md$/, '')
      const raw = fs.readFileSync(path.join(BLOG_DIR, f), 'utf-8')
      const { data } = matter(raw)
      return { ...data, slug } as BlogPostMeta
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function listPublishedPosts(): BlogPostMeta[] {
  return listBlogPosts().filter((p) => p.status === 'published')
}

export function listBlogSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
}

export const CATEGORY_LABELS: Record<string, string> = {
  operations: 'Operations & Führung',
  systeme: 'Systeme & Digitalisierung',
  ki: 'KI & Prototyping',
  exit: 'Exit & Unternehmenswert',
}

export const CATEGORY_COLORS: Record<string, string> = {
  operations: '#F44900',
  systeme: '#0D4F54',
  ki: '#1B1564',
  exit: '#191819',
}
