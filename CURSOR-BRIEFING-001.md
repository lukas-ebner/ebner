# Cursor Briefing #001: Projekt-Setup & Erste Komponenten

## Kontext

Wir bauen **lukasebner.de** – eine Personal-Brand-Website für einen Unternehmensberater. Die Website ist als "Pitch Deck im Browser" konzipiert: Jede Section ist ein Slide mit eigenem Layout-Template. Es gibt 42 verschiedene Slide-Templates in 8 Kategorien.

**Das Besondere:** Content wird über YAML-Config-Dateien gesteuert, nicht direkt in React-Komponenten. Die React-Komponenten sind reine Renderer. So kann Content separat gepflegt werden.

**GitHub Repo:** https://github.com/lukas-ebner/ebner
**Deployment:** Hetzner VPS 46.224.153.73 (Docker)
**Domain:** lukasebner.de

---

## Aufgabe

Next.js-Projekt von Grund auf aufsetzen:

1. Next.js 14+ App Router + TypeScript
2. Tailwind CSS mit vollständigem Custom Theme
3. Self-hosted Fonts (liegen bereits als WOFF2 in `/fonts/`)
4. YAML-basiertes Page-Builder-System
5. Die ersten 6 Slide-Komponenten
6. Homepage als erste Seite (mit Placeholder-Content)
7. Docker-Setup für Hetzner-Deployment

---

## Projekt-Struktur

```
ebner/
├── app/
│   ├── layout.tsx              # Root Layout (Fonts, Meta)
│   ├── page.tsx                # Homepage (liest homepage.yaml)
│   ├── [slug]/
│   │   └── page.tsx            # Dynamische Seiten (liest [slug].yaml)
│   ├── blog/
│   │   ├── page.tsx            # Blog-Übersicht (später)
│   │   └── [slug]/
│   │       └── page.tsx        # Einzelner Artikel MDX (später)
│   └── globals.css             # Tailwind Base + @font-face
├── components/
│   ├── slides/
│   │   ├── HeroSlide.tsx       # A1: Dark Hero
│   │   ├── StatementSlide.tsx  # A3: Statement (dark/orange)
│   │   ├── SplitSlide.tsx      # B1: 50/50 Text + Bild
│   │   ├── StatsSlide.tsx      # C1: Zahlen mit Count-up
│   │   ├── CTASlide.tsx        # G1: CTA
│   │   └── FullImageSlide.tsx  # H1: Vollflächiges Bild
│   ├── ui/
│   │   ├── Button.tsx          # 5 Varianten
│   │   ├── Card.tsx
│   │   └── Pill.tsx
│   ├── layout/
│   │   ├── Navigation.tsx
│   │   ├── Footer.tsx
│   │   └── SlideContainer.tsx  # Wrapper mit Intersection Observer
│   └── PageBuilder.tsx         # YAML → Slide-Sequenz Renderer
├── content/
│   └── pages/
│       └── homepage.yaml       # Erste Seite
├── lib/
│   ├── page-builder.ts         # YAML Parser + Type Registry
│   ├── animations.ts           # Framer Motion Presets
│   └── types.ts                # TypeScript Interfaces
├── public/
│   ├── fonts/                  # ← EXISTIERT BEREITS, WOFF2 drin
│   │   ├── DegularDisplay-Bold.woff2
│   │   ├── DegularDisplay-Regular.woff2
│   │   ├── InterDisplay-Bold.woff2
│   │   ├── InterDisplay-Regular.woff2
│   │   └── RobotoMono-Regular.woff2
│   └── images/
│       └── logo/               # ← SVGs hierhin verschieben
│           ├── ebner-logo.svg
│           ├── ebner-square-icon.svg
│           └── ebner-square-icon-orange.svg
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── package.json
├── Dockerfile
├── docker-compose.yml
└── .github/
    └── workflows/
        └── deploy.yml
```

**Wichtig:** Die Font-Dateien (`/fonts/*.woff2`) und Logo-SVGs liegen bereits im Projektverzeichnis. Bitte in die richtige Struktur verschieben (`public/fonts/` und `public/images/logo/`).

---

## YAML Page-Builder

### Format: content/pages/homepage.yaml

```yaml
meta:
  title: "Lukas Ebner – Vom Macher zum Unternehmer"
  description: "Unternehmensberatung für KMU: KI-Strategie, GF-Coaching, Agentur-Skalierung"
  og_image: /images/og/homepage.jpg

slides:
  - template: hero-dark
    headline: "Vom Macher zum Unternehmer."
    subtext: "Ich helfe Geschäftsführern, Strukturen zu bauen, die ohne sie funktionieren."
    cta:
      text: "Erstgespräch buchen"
      url: "/kontakt"
    image:
      src: /images/slides/hero-placeholder.jpg
      alt: "Lukas Ebner"
      opacity: 0.5

  - template: stats-dark
    stats:
      - { value: "15+", label: "Jahre als GF" }
      - { value: "1.000+", label: "Projekte" }
      - { value: "50", label: "Mitarbeiter beim Exit" }
      - { value: "2022", label: "Exit" }

  - template: statement
    variant: orange
    headline: "Bei fünf Leuten spürst du den Laden. Bei fünfzehn nicht mehr."

  - template: split
    direction: left
    headline: "KI & Automation"
    body: "Placeholder-Text für die KI-Beratung."
    cta:
      text: "Mehr erfahren"
      url: "/ki-automatisierung"
    image:
      src: /images/slides/placeholder.jpg
      alt: ""

  - template: full-image
    image:
      src: /images/slides/placeholder-fullimage.jpg
      alt: "Placeholder"
      height: 70vh

  - template: cta-dark
    headline: "Lass uns reden."
    subtext: "30 Minuten, kein Pitch. Nur ehrliches Sparring."
    cta:
      text: "Termin buchen"
      url: "/kontakt"
    image:
      src: /images/slides/cta-placeholder.jpg
      alt: ""
      opacity: 0.4
```

### PageBuilder Logik

```typescript
// lib/types.ts
export interface SlideConfig {
  template: string
  [key: string]: any
}

export interface PageConfig {
  meta: {
    title: string
    description: string
    og_image?: string
  }
  slides: SlideConfig[]
}

// lib/page-builder.ts
import yaml from 'js-yaml'
import fs from 'fs'
import path from 'path'
import { PageConfig } from './types'

export function loadPage(slug: string): PageConfig {
  const filePath = path.join(process.cwd(), 'content', 'pages', `${slug}.yaml`)
  const raw = fs.readFileSync(filePath, 'utf-8')
  return yaml.load(raw) as PageConfig
}

// components/PageBuilder.tsx
'use client'
import { SlideConfig } from '@/lib/types'
import { HeroSlide } from './slides/HeroSlide'
import { StatementSlide } from './slides/StatementSlide'
import { StatsSlide } from './slides/StatsSlide'
import { SplitSlide } from './slides/SplitSlide'
import { CTASlide } from './slides/CTASlide'
import { FullImageSlide } from './slides/FullImageSlide'
import { SlideContainer } from './layout/SlideContainer'

const SLIDE_REGISTRY: Record<string, React.ComponentType<any>> = {
  'hero-dark': HeroSlide,
  'statement': StatementSlide,
  'stats-dark': StatsSlide,
  'split': SplitSlide,
  'cta-dark': CTASlide,
  'full-image': FullImageSlide,
}

export function PageBuilder({ slides }: { slides: SlideConfig[] }) {
  return (
    <main>
      {slides.map((slide, i) => {
        const Component = SLIDE_REGISTRY[slide.template]
        if (!Component) {
          console.warn(`Unknown slide template: ${slide.template}`)
          return null
        }
        return (
          <SlideContainer key={i} index={i}>
            <Component {...slide} />
          </SlideContainer>
        )
      })}
    </main>
  )
}
```

---

## Tailwind Config

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#F44900',
        teal: {
          DEFAULT: '#0D4F54',
          mid: '#1A7A82',
          light: '#E6EEEF',
        },
        surface: {
          light: '#F1F1F1',
          cool: '#F8FAFC',
          dark: '#020617',
        },
        text: {
          primary: '#191819',
          light: '#F1F1F1',
          muted: '#6B7280',
          dimmed: '#4B5563',
        },
        success: '#2D6A4F',
        warning: '#D97706',
        border: {
          DEFAULT: '#D1D5DB',
          dark: '#374151',
        },
      },
      fontFamily: {
        display: ['Degular Display', 'sans-serif'],
        body: ['Inter Display', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      fontSize: {
        'stat': ['clamp(48px, 8vw, 96px)', { lineHeight: '1.0' }],
        'h1': ['clamp(36px, 5vw, 72px)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'h2': ['clamp(28px, 3.5vw, 44px)', { lineHeight: '1.2' }],
        'h3': ['clamp(22px, 2.5vw, 28px)', { lineHeight: '1.3' }],
        'body': ['clamp(16px, 1.2vw, 20px)', { lineHeight: '1.65' }],
        'pill': ['11px', { lineHeight: '1', letterSpacing: '0.12em' }],
        'label': ['13px', { lineHeight: '1', letterSpacing: '0.08em' }],
      },
      spacing: {
        'section-mobile': '64px',
        'section-desktop': '96px',
        'hero': '128px',
      },
      borderRadius: {
        'card': '12px',
        'button': '6px',
        'pill': '999px',
      },
    },
  },
  plugins: [],
}

export default config
```

---

## Font-Loading (globals.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@font-face {
  font-family: 'Degular Display';
  src: url('/fonts/DegularDisplay-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Degular Display';
  src: url('/fonts/DegularDisplay-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Inter Display';
  src: url('/fonts/InterDisplay-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Inter Display';
  src: url('/fonts/InterDisplay-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Roboto Mono';
  src: url('/fonts/RobotoMono-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

/* Base styles */
body {
  font-family: 'Inter Display', sans-serif;
  color: #191819;
  background-color: #F1F1F1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

## Slide-Komponenten Spezifikationen

### A1: HeroSlide (Dark)
- Vollbreite, `min-h-screen`
- Hintergrundbild: `object-cover`, Opacity aus YAML (0.4-0.6), Gradient-Overlay von unten (`bg-gradient-to-t from-surface-dark via-surface-dark/60 to-transparent`)
- Content: links oder zentriert (konfigurierbar), vertikal zentriert
- Headline: `font-display font-bold text-h1 text-text-light`
- Subtext: `font-body text-body text-text-light/80 max-w-xl`
- CTA: Primary Button (`bg-brand text-white rounded-button px-8 py-4 font-display`)
- Animation: Fade-in + slide-up beim Mount (Framer Motion, 0.6s ease-out)

### A3: StatementSlide
- Vollbreite, `py-section-desktop` (96px)
- Zwei Varianten via `variant` prop:
  - `dark`: bg `surface-dark`, text `text-light`
  - `orange`: bg `brand`, text white
- Headline: `font-display font-bold text-h1 text-center max-w-[900px] mx-auto`
- Optional: Hintergrundbild mit 10-20% Opacity
- Animation: Fade-in bei Scroll-In

### B1: SplitSlide
- Zweispaltig: Grid `grid-cols-1 lg:grid-cols-2`
- `direction` prop: `left` (Text links) oder `right` (Text rechts)
- Text-Seite: `p-12 lg:p-24 flex flex-col justify-center`
  - H2: `font-display text-h2 text-text-primary`
  - Body: `font-body text-body text-text-primary mt-4`
  - CTA: Secondary Button (optional)
- Bild-Seite: `relative overflow-hidden`, Bild `object-cover h-full w-full`, optional `rounded-card`
- Background: `bg-surface-light`

### C1: StatsSlide (Dark)
- Background: `bg-surface-dark`
- Padding: `py-section-desktop`
- Grid: `grid-cols-2 lg:grid-cols-4 gap-8`
- Jede Stat:
  - Zahl: `font-display font-bold text-stat text-text-light`
  - Label: `font-mono text-pill uppercase tracking-widest text-text-muted mt-2`
- Count-up Animation: Intersection Observer trigger, 2s duration, ease-out
- Nutze `useInView` von Framer Motion + custom counter hook

### G1: CTASlide (Dark)
- Ähnlich HeroSlide, aber conversion-fokussiert
- Hintergrundbild mit Overlay (wie Hero)
- Content zentriert
- Headline: `font-display font-bold text-h2 text-text-light`
- Subtext: `font-body text-body text-text-light/70`
- CTA: Primary Button (groß)

### H1: FullImageSlide
- Vollbreite, konfigurierbare Höhe (default `h-[70vh]`)
- Bild: `object-cover w-full h-full`
- Kein Text, kein Overlay – reiner visueller Rhythmus-Brecher

---

## SlideContainer (Wrapper)

Jeder Slide wird in einen `SlideContainer` gewickelt:

```typescript
// components/layout/SlideContainer.tsx
'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface Props {
  children: React.ReactNode
  index: number
}

export function SlideContainer({ children, index }: Props) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
    >
      {children}
    </motion.section>
  )
}
```

---

## Navigation

- Sticky top, transparent auf Hero, weiß/dunkel nach Scroll
- Logo links: ebner-logo.svg (auf Dunkel: weiße Version, auf Hell: dunkle Version)
- Nav-Items rechts: `font-mono text-label uppercase tracking-wide`
- Items: Leistungen (Dropdown), Projekte, Über mich, Blog, Kontakt
- Mobile: Hamburger → Fullscreen Overlay
- Dropdown "Leistungen": 4 Service-Links mit kurzer Beschreibung

---

## Docker

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/content ./content
EXPOSE 3000
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}
module.exports = nextConfig
```

---

## Packages

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
npm install framer-motion js-yaml
npm install -D @types/js-yaml
```

---

## Akzeptanzkriterien

- [ ] `npm run dev` startet ohne Fehler
- [ ] Homepage zeigt alle 6 Demo-Slides
- [ ] Fonts laden korrekt (Degular Display in Headlines, Inter Display im Body, Roboto Mono in Labels)
- [ ] Tailwind Custom Theme funktioniert (brand, teal, surface Farben sichtbar)
- [ ] YAML-Änderungen an homepage.yaml reflektieren sich nach Page Reload
- [ ] `npm run build` läuft fehlerfrei durch
- [ ] `docker build .` erzeugt lauffähiges Image
- [ ] Responsive: Mobile + Desktop funktionieren
- [ ] Framer Motion: Fade-in auf Slides, Count-up auf Stats
- [ ] Navigation: Sticky, Logo, Items, Mobile-Hamburger (Grundgerüst)
- [ ] Placeholder-Bilder: Wo Bilder fehlen, zeige graue Flächen mit Dimensionen-Label

---

*Briefing von Laura (Cowork) – 21. März 2026*
*Bei Fragen: Kontext liegt in Basic Memory unter `ebner-site/`*
