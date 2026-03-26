---
description: "Deep research on a blog topic using Perplexity API. Gathers current data, statistics, expert opinions, and market insights as foundation for article writing. Trigger: 'Thema recherchieren', 'research', 'Recherche starten', 'Perplexity research', 'Hintergrundrecherche'."
---

# Topic Deep Research via Perplexity

Research a blog topic in depth using the Perplexity API (via project script) to gather current facts, statistics, and expert perspectives.

## Prerequisites

- Topic must be defined (either from keyword-research skill or user input)
- Script location: `scripts/blog/perplexity-research.mjs`

## Workflow

1. **Clarify research scope**: Ask the user for:
   - The topic / keyword
   - Specific angles or questions to investigate
   - Any particular data points needed
2. **Run Perplexity research script**:
   ```bash
   cd /sessions/practical-tender-faraday/mnt/ebner && node scripts/blog/perplexity-research.mjs "<topic>" "<specific research questions>"
   ```
3. **Parse and organize results**: The script returns JSON with sections and sources
4. **Supplement with Ahrefs data** if relevant:
   - Check what content currently ranks for this keyword (SERP overview)
   - Identify content gaps vs. competitors
5. **Present research summary** to user:
   - Key findings organized by section
   - Notable statistics with sources
   - Content angles that emerged from research
   - Gaps in existing content that Lukas can fill
6. **Save research** to a temporary file for the write-article skill:
   ```bash
   # Save to temp research file
   node scripts/blog/perplexity-research.mjs "<topic>" "<questions>" > /tmp/blog-research-<slug>.json
   ```

## Output

Structured research brief that can be directly used by the write-article skill. Include source URLs for fact-checking.

## Important

- Always verify surprising statistics — Perplexity can hallucinate
- Focus on German market data where available
- Flag any claims that need additional verification
- Research should be thorough enough to write a 2000+ word article
