---
description: "SEO keyword research and topic recommendations for the lukasebner.de blog. Analyzes keyword opportunities using Ahrefs MCP, evaluates existing content gaps, and suggests high-potential article topics. Trigger: 'keyword research', 'Themenrecherche', 'welche Keywords', 'Blog-Themen finden', 'nächster Artikel', 'content gap'."
---

# Keyword Research & Topic Recommendation

Perform SEO keyword research for lukasebner.de blog articles using the connected Ahrefs MCP.

## Context

The blog covers 4 clusters:
- **operations** (Operations & Führung) — Color: #F44900
- **systeme** (Systeme & Digitalisierung) — Color: #0D4F54
- **ki** (KI & Prototyping) — Color: #1B1564
- **exit** (Exit & Unternehmenswert) — Color: #191819

Target audience: Geschäftsführer von IT-Dienstleistern und Agenturen (5-50 MA), Raum Regensburg/Bayern/DACH.

Existing articles are in `content/blog/*.md` — read them first to avoid duplicates.

## Workflow

1. **Check existing content**: Read all files in `content/blog/` to understand what's already covered
2. **Use Ahrefs MCP** for keyword data:
   - `keywords-explorer-overview` — Get volume, KD, CPC for seed keywords
   - `keywords-explorer-matching-terms` — Find related keyword opportunities
   - `keywords-explorer-related-terms` — Discover semantically related terms
   - `keywords-explorer-search-suggestions` — Get autocomplete suggestions
3. **Evaluate opportunities**: Score each keyword by:
   - KD (prefer ≤ 10 for quick wins)
   - Search volume (minimum 20 SV for DE)
   - Commercial intent (CPC as proxy)
   - Relevance to Lukas' expertise and services
4. **Recommend 3-5 article topics** with:
   - Primary keyword + nebenkeywords
   - Estimated KD and SV
   - Suggested category (operations/systeme/ki/exit)
   - Funnel position (TOFU/MOFU/BOFU)
   - Brief angle/hook suggestion
   - Why this topic NOW (trend, gap, seasonality)

## Output Format

Present recommendations as a ranked table, then ask which topic the user wants to pursue.

## Important

- Always check Ahrefs for CURRENT data — don't rely on cached/memorized numbers
- Prioritize keywords where lukasebner.de can realistically rank (DR 0-10 domain)
- Consider internal linking opportunities to existing pillar pages (/operations, /digitalisierung, /ki-readiness)
- Flag "Blue Ocean" keywords (not yet indexed in Ahrefs = no competition)
