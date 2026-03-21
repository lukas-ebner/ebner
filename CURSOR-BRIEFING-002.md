# Cursor Briefing #002: Cards Grid, Lucide Icons, Fixes

## Kontext

Briefing #001 ist erledigt. Die Basis steht. Jetzt brauchen wir eine neue Komponente, ein Icon-System und ein paar Korrekturen.

Die `content/pages/homepage.yaml` wurde aktualisiert und enthält jetzt 11 echte Slides (statt 6 Placeholder). Zwei davon nutzen ein neues Template `cards-grid`, das noch gebaut werden muss.

---

## Aufgabe 1: Lucide Icons installieren und integrieren

```bash
npm install lucide-react
```

Icons werden in der YAML per Name referenziert (z.B. `icon: building-2`) und in Komponenten über ein Mapping gerendert:

```typescript
// lib/icons.ts
import {
  Building2, Layers, Bot, Timer, GraduationCap,
  Zap, Rocket, ArrowRight, Check, ChevronDown,
  Menu, X, ExternalLink, Mail, Phone, MapPin,
  Linkedin, Github, Calendar,
  type LucideIcon,
} from 'lucide-react'

export const iconMap: Record<string, LucideIcon> = {
  'building-2': Building2,
  'layers': Layers,
  'bot': Bot,
  'timer': Timer,
  'graduation-cap': GraduationCap,
  'zap': Zap,
  'rocket': Rocket,
  'arrow-right': ArrowRight,
  'check': Check,
  'chevron-down': ChevronDown,
  'menu': Menu,
  'x': X,
  'external-link': ExternalLink,
  'mail': Mail,
  'phone': Phone,
  'map-pin': MapPin,
  'linkedin': Linkedin,
  'github': Github,
  'calendar': Calendar,
}

export function getIcon(name: string): LucideIcon | null {
  return iconMap[name] ?? null
}
```

Nutze diese Map überall wo Icons aus YAML-Daten gerendert werden.

---

## Aufgabe 2: Neue Komponente `CardsGridSlide`

Template-Name in YAML: `cards-grid`

### Props

```typescript
interface CardsGridSlideProps {
  headline: string
  subtext?: string
  variant?: 'light' | 'dark'  // default: 'light'
  cards: {
    icon?: string          // Lucide Icon Name
    pill?: string          // z.B. "GRÜNDER & CEO", "EXIT 2022"
    title: string
    body: string
    cta?: {
      text: string
      url: string
    }
  }[]
}
```

### Design

**Light Variant (default):**
- Background: `bg-surface-light`
- Padding: `py-section-mobile lg:py-section-desktop`
- Headline: `font-display text-h2 font-bold text-text-primary text-center`
- Subtext: `font-body text-body text-text-muted text-center max-w-2xl mx-auto mt-4`
- Cards Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` (bei 4 Cards: `lg:grid-cols-4`, bei 3: `lg:grid-cols-3`)
- Max-width: `max-w-6xl mx-auto px-6`

**Dark Variant:**
- Background: `bg-surface-dark`
- Headline: `text-text-light`
- Subtext: `text-text-muted`
- Cards: `bg-surface-dark border border-border-dark` statt weißem Background

**Einzelne Card:**
- Background (light): `bg-white rounded-card p-8 shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.01]`
- Background (dark): `bg-surface-dark border border-border-dark rounded-card p-8 hover:border-brand/50 transition-all duration-200`
- Icon: `w-10 h-10 text-brand mb-4` (Lucide Icon)
- Pill (optional): `<Pill>` Komponente, `mb-3`
- Title: `font-display text-h3 font-bold` (light: `text-text-primary`, dark: `text-text-light`)
- Body: `font-body text-body mt-2` (light: `text-text-muted`, dark: `text-text-muted`)
- CTA (optional): `mt-4` – Text-Link mit Arrow-Right Icon, `text-brand font-mono text-label uppercase tracking-wide hover:underline`

Jede Card bekommt Framer Motion stagger animation (fade-in + slide-up, 100ms delay pro Card).

### Registrierung

In `components/PageBuilder.tsx`, importiere `CardsGridSlide` und registriere als `'cards-grid'`.

---

## Aufgabe 3: Navigation Fixes

In `components/layout/Navigation.tsx`:

1. **Slug-Korrekturen** in den `services` Array:
   - `/gf-coaching` → `/geschaeftsfuehrer-coaching`
   - `/strategie` → `/vibe-coding-beratung`
   - Titel "Strategie" → "Vibe Coding"
   - Desc für Vibe Coding: "AI-First Produkte und Prototypen bauen."

2. **Service-Descriptions aktualisieren:**
   ```typescript
   const services = [
     {
       href: '/ki-automatisierung',
       title: 'KI & Automation',
       desc: 'KI einführen – wo es sich wirklich lohnt.',
     },
     {
       href: '/geschaeftsfuehrer-coaching',
       title: 'GF-Coaching',
       desc: 'Vom Macher zum Unternehmer.',
     },
     {
       href: '/agentur-skalieren',
       title: 'Agentur-Skalierung',
       desc: 'Prozesse, Margen, Team – systematisch skalieren.',
     },
     {
       href: '/vibe-coding-beratung',
       title: 'Vibe Coding',
       desc: 'AI-First Produkte und Prototypen bauen.',
     },
   ]
   ```

3. **Lucide Icons statt SVG** für den Hamburger-Button:
   ```tsx
   import { Menu, X } from 'lucide-react'
   // ...
   {menuOpen ? <X size={24} /> : <Menu size={24} />}
   ```

4. **ChevronDown** Icon neben "Leistungen":
   ```tsx
   import { ChevronDown } from 'lucide-react'
   // ...
   <button ...>
     Leistungen <ChevronDown size={14} className="ml-1 inline" />
   </button>
   ```

---

## Aufgabe 4: Footer aktualisieren

4-Spalten Footer gemäß Design-Spec:

```
| Brand + Social          | Leistungen              | Mehr                    | Kontakt                 |
|------------------------|------------------------|------------------------|------------------------|
| ebner Logo             | KI & Automation        | Projekte               | Lukas Ebner             |
| Kurzer Claim           | GF-Coaching            | Über mich              | Regensburg              |
| LinkedIn / GitHub      | Agentur-Skalierung     | Blog                   | mail: hi@lukasebner.de  |
|                        | Vibe Coding            | Ressourcen             |                         |
|                        |                        |                        |                         |
| ──────────────────────────────────────────────────────────────────────────── |
| © 2026 Lukas Ebner · Wachstumscoach GmbH         Impressum · Datenschutz   |
```

- Background: `bg-surface-dark`
- Text: `text-text-light`
- Links: `text-text-muted hover:text-brand`
- Section-Labels: `font-mono text-pill uppercase tracking-widest text-text-muted mb-4`
- Link-Items: `font-body text-sm`
- Legal line: `border-t border-border-dark mt-12 pt-6 text-text-dimmed text-sm`
- Social Icons: Lucide `Linkedin`, `Github` – `w-5 h-5 text-text-muted hover:text-brand`
- Claim unter Logo: "Ein Anstoß. Alles in Bewegung." (font-body text-sm text-text-muted)

---

## Akzeptanzkriterien

- [ ] `npm install lucide-react` erfolgreich
- [ ] Homepage zeigt alle 11 Slides (inkl. 2× cards-grid)
- [ ] Self-Segmentation (Slide 4): 3 Cards mit Icons, heller Hintergrund
- [ ] Ventures (Slide 9): 4 Cards mit Icons + Pills, dunkler Hintergrund
- [ ] Cards haben stagger-Animation beim Scroll-In
- [ ] Nav: Korrekte Slugs, Leistungen-Dropdown mit Chevron, Lucide Hamburger
- [ ] Footer: 4 Spalten, Social Icons, Legal Line
- [ ] Externe Links (leadtime.app, fracto.de, kraftwerk.io) öffnen in neuem Tab
- [ ] `npm run build` + `npm run lint` grün
- [ ] Mobile responsive: Cards stacken, Footer wird 1-spaltig

---

*Briefing von Laura (Cowork) – 21. März 2026*
