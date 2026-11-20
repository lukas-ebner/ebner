import type { MetadataRoute } from 'next'

/**
 * Suchmaschinen und KI-Crawler ausdrücklich zulassen. Die KI-Bots werden einzeln
 * genannt, damit klar ist, dass Training und KI-Suche erwünscht sind
 * (Sichtbarkeit in ChatGPT, Claude, Perplexity, Gemini, Copilot, Apple).
 * Nur API-Routen und Danke-Seiten bleiben außen vor.
 */
const DISALLOW = ['/api/', '/unverzichtbar/danke']

const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'GoogleOther',
  'Applebot',
  'Applebot-Extended',
  'Bingbot',
  'DuckAssistBot',
  'Meta-ExternalAgent',
  'MistralAI-User',
  'CCBot',
  'cohere-ai',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      { userAgent: AI_CRAWLERS, allow: '/', disallow: DISALLOW },
    ],
    sitemap: 'https://lukasebner.de/sitemap.xml',
    host: 'https://lukasebner.de',
  }
}
