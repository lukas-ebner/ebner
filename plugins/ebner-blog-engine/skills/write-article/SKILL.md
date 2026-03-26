---
description: "Write a complete SEO-optimized blog article for lukasebner.de with anti-AI detection and revision loop. Creates publication-ready markdown with proper frontmatter. Trigger: 'Artikel schreiben', 'Blog schreiben', 'write article', 'Artikel erstellen', 'Text schreiben'."
---

# Write Blog Article

Write a complete, SEO-optimized blog article for lukasebner.de, then run it through anti-AI detection with revision loop.

## Context: Lukas' Voice

Lukas Ebner schreibt so:
- **Direkt und ehrlich** — keine Buzzwords, kein Corporate-Speak
- **Erfahrungsbasiert** — "Bei eins+null habe ich..." / "In 15 Jahren habe ich gelernt..."
- **Kurze und lange Sätze mischen** — Dynamik, nicht Monotonie
- **Meinung haben** — klare Positionen, keine Hedge-Sprache
- **Du-Ansprache** — direkt zum Leser
- **Praxis vor Theorie** — Beispiele, Cases, Zahlen
- **Kein Pathos** — kein "In der heutigen schnelllebigen Zeit..."
- **Humor erlaubt** — trocken, situativ, sparsam

## Workflow

### Phase 1: Angle Selection

Before writing, propose 2-3 angles/hooks for the article. **CRITICAL: Show each angle in FULL DETAIL in the chat** — not just a one-liner. Each angle must include:
- **Title** (working title for this angle)
- **Hook** (the exact opening 2-3 sentences)
- **Structure outline** (H2 sections this angle would produce)
- **Emotional entry point** (provocative statement, personal story, contrarian take, or data-driven opening)

Present all angles in the chat and wait for the user to pick or combine before proceeding.

### Phase 2: Writing

1. **Read existing article draft** (if exists in `content/blog/<slug>.md`)
2. **Read research** (if available from research-topic skill)
3. **Write the full article** following these rules:
   - **Title**: Max 60 chars, keyword near front, provocative or clear value prop
   - **Opening**: Hook in first 2 sentences. No "In diesem Artikel..." garbage
   - **Structure**: H2 sections from outline, but natural flow, not mechanical
   - **Length**: 1800-2500 words body text
   - **Keyword integration**: Primary keyword in H1, first paragraph, 2-3 H2s, naturally through text. Nebenkeywords where they fit organically
   - **Personal stories**: Min 2 references to Lukas' own experience
   - **CTA**: Natural transition to service page at the end, not forced
   - **Formatting**: Prose-heavy. Lists only where they genuinely help. No more than 2 bullet lists per article
4. **Save article** to `content/blog/<slug>.md` with complete frontmatter

### Phase 3: Anti-AI Detection

1. **Run detection script**:
   ```bash
   cd /sessions/practical-tender-faraday/mnt/ebner && node scripts/blog/ai-detect.mjs content/blog/<slug>.md
   ```
2. **Evaluate results**:
   - Score < 20 (PASS): Proceed to images
   - Score 20-40 (BORDERLINE): Show issues, offer revision
   - Score > 40 (FAIL): Mandatory revision

### Phase 4: Revision Loop (if needed)

If AI score is too high:
1. Read the specific issues from ai-detect output
2. Revise the article targeting each flagged issue:
   - Replace AI phrases with Lukas' natural voice
   - Vary sentence lengths more dramatically
   - Add more personal anecdotes
   - Convert lists to prose
   - Make paragraph starts more diverse
3. Save revised version
4. Re-run ai-detect
5. Repeat until score < 25 or max 3 iterations

## Frontmatter Template

```yaml
---
title: ""
slug: ""
description: ""  # Max 155 chars for meta description
keyword: ""
nebenkeywords: []
category: operations | systeme | ki | exit
status: draft
funnel: TOFU | MOFU | BOFU
kd: ""
date: ""
image: ""
cta:
  text: ""
  url: ""
---
```

## Important

- NEVER use these words/phrases: "tauchen wir ein", "lass uns erkunden", "in der heutigen Zeit", "game-changer", "deep dive", "leverage", "navigate", "landscape", "holistic", "synergy", "paradigm", "streamline"
- Every H2 should be interesting enough to read on its own
- End sections with a hook to the next section, not a summary
- Include at least one contrarian or surprising take
- **After writing: Show the intro + first H2 section in the chat** so the user can review voice and tone before continuing. Don't just say "article saved" — show the actual text
