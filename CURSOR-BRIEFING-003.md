# Cursor Briefing #003: Premium Design Refinement

## Kontext

Die Homepage steht funktional. Aber der visuelle Eindruck ist noch nicht "Premium". Drei zentrale Korrekturen: Headlines leichter, Icons kleiner, Orange dezenter. Außerdem kleinere Typografie-Tweaks.

Die homepage.yaml wurde aktualisiert (neuer Content). Keine YAML-Änderungen nötig, nur Komponenten-Styling.

---

## Aufgabe 1: Headlines – Degular Display Regular statt Bold

Die Headlines wirken zu laut und "schreien". Premium bedeutet Ruhe und Selbstbewusstsein.

### Änderungen

**HeroSlide.tsx:**
```diff
- <h1 className="font-display text-h1 font-bold text-text-light">
+ <h1 className="font-display text-h1 font-normal text-text-light">
```

**StatementSlide.tsx:**
```diff
- <h2 className={`text-center font-display text-h1 font-bold ${headlineClass}`}>
+ <h2 className={`text-center font-display text-h1 font-normal leading-tight ${headlineClass}`}>
```

**SplitSlide.tsx:**
```diff
- <h2 className="font-display text-h2 font-bold text-text-primary">
+ <h2 className="font-display text-h2 font-normal text-text-primary">
```

**CardsGridSlide.tsx – Section Headline:**
```diff
- <h2 className={`text-center font-display text-h2 font-bold ${headlineClass}`}>
+ <h2 className={`text-center font-display text-h2 font-normal ${headlineClass}`}>
```

**CardsGridSlide.tsx – Card Titles:**
Card titles bleiben `font-semibold` (nicht bold) – die brauchen etwas Gewicht als Anker innerhalb der Card:
```diff
- <h3 className={`font-display text-h3 font-bold ${titleClass}`}>
+ <h3 className={`font-display text-h3 font-semibold ${titleClass}`}>
```

**CTASlide.tsx:**
```diff
- Headline: font-bold → font-normal
```

**StatsSlide.tsx:**
Stats-Zahlen bleiben `font-bold` – die leben davon, dass sie fett sind.

### Zusammenfassung Font-Weight-Regeln:
| Element | Weight | Warum |
|---|---|---|
| H1 (Hero, Statement) | `font-normal` (400) | Ruhe, Eleganz, Premium |
| H2 (Section Headlines) | `font-normal` (400) | Konsistenz mit H1 |
| H3 (Card Titles) | `font-semibold` (600) | Brauchen Anker-Gewicht in Card |
| Stats-Zahlen | `font-bold` (700) | Müssen knallen, sind der Zweck |
| Body | `font-normal` (400) | Standard |
| Nav/Labels/Pills | `font-normal` (400) | Roboto Mono trägt sich selbst |

---

## Aufgabe 2: Icons verkleinern

Die Icons bei `h-10 w-10` (40px) sind zu dominant und wirken billig. Premium = zurückhaltend.

**CardsGridSlide.tsx:**
```diff
- <Icon className="mb-4 h-10 w-10 text-brand" aria-hidden />
+ <Icon className="mb-4 h-6 w-6 text-brand" strokeWidth={1.5} aria-hidden />
```

Auch `strokeWidth={1.5}` statt dem Lucide-Default von 2 – macht die Icons filigraner.

**Überall wo Icons auftauchen:** Standard-Größe ist `h-5 w-5` oder `h-6 w-6`, nie größer als `h-8 w-8`.

---

## Aufgabe 3: Orange dezenter einsetzen

Das Brand-Orange (#F44900) soll ein Akzent sein, keine Fläche. Folgende Änderungen:

### Statement Slide – Orange Variant entfernen

Kein vollfächiger orangefarbener Hintergrund mehr. Stattdessen zwei Varianten:
- `dark`: bg-surface-dark (wie bisher)
- `accent`: bg-surface-dark mit einer dünnen horizontalen Linie (#F44900) über der Headline

**StatementSlide.tsx** – wenn `variant === 'orange'`:
```tsx
// Statt vollfarbigem Orange-Hintergrund:
// Dunkler Hintergrund + orange Akzentlinie über dem Text
<div className="bg-surface-dark ...">
  <div className="mx-auto max-w-[900px]">
    <div className="mx-auto mb-8 h-[2px] w-16 bg-brand" />
    <h2 className="text-center font-display text-h1 font-normal text-text-light">
      {headline}
    </h2>
  </div>
</div>
```

So bekommt der Statement-Slide einen subtilen orangen Marker, ohne dass die ganze Section schreit.

### Buttons – Primary CTA etwas zurücknehmen

Der Primary Button bleibt orange, aber etwas kleiner und mit weniger Padding:
```diff
- px-8 py-4 text-base
+ px-6 py-3 text-sm tracking-wide
```

Und den border-radius etwas schärfer:
```diff
- rounded-button (6px)
+ rounded-md (6px ist ok, alternativ rounded-sm für 4px)
```

### Card CTAs

Die orangefarbenen Text-Links in Cards sind ok – das ist der richtige Einsatz von Orange (interaktive Elemente).

### Hover-Underlines

Die orange Hover-Underlines auf Nav-Items und Links bleiben – das ist der subtile, richtige Einsatz.

---

## Aufgabe 4: Weitere Typografie-Feinheiten

### Body-Text in Splits lesbarer machen

Die Split-Slides haben teilweise lange Texte. Etwas mehr line-height und etwas gedecktere Farbe:
```diff
- <p className="mt-4 font-body text-body text-text-primary">
+ <p className="mt-4 font-body text-body leading-relaxed text-text-dimmed">
```

`text-text-dimmed` (#4B5563) statt `text-text-primary` (#191819) – weniger Kontrast, angenehmer zum Lesen langer Absätze. Die Headline in `text-text-primary` bleibt dunkel als Anker.

### Stats Labels etwas weiter weg von der Zahl

```diff
- mt-2
+ mt-3
```

### Card Body auch etwas gedämpfter

```diff
- text-text-muted
+ text-text-dimmed (auf Light) / text-text-muted (auf Dark)
```

---

## Aufgabe 5: Allgemeine Premium-Signale

### Mehr vertikaler Raum

Die Sections können etwas mehr atmen. Section-Padding hochsetzen:
```diff
- py-section-mobile lg:py-section-desktop  (64px / 96px)
+ py-20 lg:py-32  (80px / 128px)
```

Oder alternativ die Spacing-Tokens in tailwind.config.ts anpassen:
```diff
- 'section-mobile': '64px',
- 'section-desktop': '96px',
+ 'section-mobile': '80px',
+ 'section-desktop': '128px',
```

### Hero Subtext-Größe

Der Subtext im Hero darf etwas größer – er ist der zweitwichtigste Text auf der Seite:
```diff
- text-body (clamp 16-20px)
+ text-lg lg:text-xl
```

### Navigation – Logo etwas kleiner

```diff
- h-8 max-w-[140px]
+ h-6 max-w-[120px]
```

Kleineres Logo = mehr Premium. Vergleich: Apple, Porsche, Aesop – die Logo-Größe auf deren Websites ist minimal.

---

## Akzeptanzkriterien

- [ ] Alle Section-Headlines in Degular Display Regular (font-normal), nicht Bold
- [ ] Card-Titles in font-semibold (Kompromiss)
- [ ] Stats-Zahlen bleiben font-bold
- [ ] Icons in Cards: h-6 w-6 mit strokeWidth 1.5
- [ ] Statement-Slide "orange" variant: dunkler Hintergrund + orange Akzentlinie, kein orangener BG
- [ ] Buttons: etwas kompakter (px-6 py-3)
- [ ] Body-Text in Splits: text-text-dimmed statt text-text-primary, leading-relaxed
- [ ] Section-Padding erhöht auf 80/128px
- [ ] Logo in Nav etwas kleiner (h-6)
- [ ] Gesamteindruck: ruhig, selbstbewusst, Premium – nicht laut
- [ ] `npm run build` + `npm run lint` grün

---

*Briefing von Laura (Cowork) – 21. März 2026*
*Design-Philosophie: Premium = Zurückhaltung. Was weglassen, nicht was hinzufügen.*
