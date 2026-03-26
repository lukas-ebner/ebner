# ebner-blog-engine

Full blog content pipeline for lukasebner.de — from keyword research to published article.

## Skills

| Skill | Trigger | What it does |
|-------|---------|--------------|
| keyword-research | "keyword research", "Themenrecherche" | SEO keyword analysis via Ahrefs MCP |
| research-topic | "Thema recherchieren", "research" | Deep research via Perplexity API |
| write-article | "Artikel schreiben" | Write article + anti-AI detection loop |
| generate-images | "Bilder generieren" | NanoBanana API image generation |
| full-pipeline | "Blog Pipeline", "neuer Blogartikel" | Complete pipeline: research → write → images → publish |

## Agents

| Agent | Purpose |
|-------|---------|
| content-reviewer | Quality review: AI detection, voice, SEO, readability |

## Scripts (in project)

All heavy lifting runs as Node.js scripts in `scripts/blog/`:

| Script | Purpose |
|--------|---------|
| perplexity-research.mjs | Perplexity API deep research |
| ai-detect.mjs | Heuristic AI pattern detection |
| generate-image.mjs | NanoBanana image generation + polling |
| publish.mjs | Set article status to published |

## Environment Variables

Set in `scripts/blog/.env`:
- `PERPLEXITY_API_KEY` — Perplexity API token
- `NANOBANANA_API_KEY` — NanoBanana API key

## Integration

- **Ahrefs MCP**: Must be connected for keyword research
- **LinkedIn Content Engine**: Optional handoff after publishing via `linkedin-content-engine:promote`
