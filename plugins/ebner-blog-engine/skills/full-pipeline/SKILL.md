---
description: "Complete blog article pipeline from keyword research to publishing. Orchestrates all blog-engine skills in sequence: research → write → AI-check → images → publish → optional LinkedIn promotion. Trigger: 'Blog Pipeline', 'Artikel-Pipeline', 'neuer Blogartikel', 'full pipeline', 'kompletter Artikel', 'Blog erstellen komplett'."
---

# Full Blog Pipeline

Orchestrate the complete blog article creation pipeline from keyword research to publishing.

## Pipeline Steps

### Step 1: Topic & Keyword (keyword-research skill)
- If user has a topic: validate it with Ahrefs keyword data
- If user needs ideas: run full keyword research, present options
- Output: confirmed topic, primary keyword, nebenkeywords, category, funnel

### Step 2: Deep Research (research-topic skill)
- Run Perplexity research on the confirmed topic
- Gather statistics, expert opinions, market data
- Save research to temp file for writing phase
- Output: structured research brief

### Step 3: Writing (write-article skill)
- Propose 2-3 angles, let user pick
- Write complete article with SEO optimization
- Save to `content/blog/<slug>.md`
- Output: draft article

### Step 4: Anti-AI Check (write-article skill, phase 3-4)
- Run `scripts/blog/ai-detect.mjs` on the article
- If score > 25: revise and re-check (max 3 iterations)
- Output: clean article with AI score < 25

### Step 5: Image Generation (generate-images skill)
- Propose hero image concept based on article content
- Generate via NanoBanana API
- Update article frontmatter with image path
- Output: article with hero image

### Step 6: Review & Publish
- Show user the complete article summary:
  - Title, keyword, category, word count, AI score
  - Hero image preview path
  - CTA link
- Ask for final approval
- On approval, run publish script:
  ```bash
  cd /sessions/practical-tender-faraday/mnt/ebner && node scripts/blog/publish.mjs <slug>
  ```

### Step 7: LinkedIn Promotion (optional)
- Ask user if they want to promote on LinkedIn
- If yes, hand off to `linkedin-content-engine:promote` skill with:
  - Article title and URL
  - Key quote or statement for image overlay
  - Article summary for post text

## CRITICAL: Always Show Drafts & Options in Chat

**Never silently skip decision points.** At every step where there are options or drafts, you MUST present them in full detail in the chat so the user can review and choose:

- **Angles (Step 3):** Show 2-3 angle proposals with title, hook, and structure outline — in full, not summarized
- **Article Draft (Step 3-4):** After writing, show a representative excerpt (intro + first section) in the chat. Don't just say "article written"
- **Image Concepts (Step 5):** Show 2-3 image prompt ideas with detailed descriptions BEFORE generating. After generation, show the image file path so the user can view it in their browser. Never generate without showing the concept first
- **Final Review (Step 6):** Show complete summary with all metadata

The user wants to SEE and APPROVE every intermediate result. No auto-piloting through steps.

## Other Rules

- Track progress visually — tell the user which step we're on
- If any step fails, offer to retry or skip
- The entire pipeline should take 15-30 minutes per article
- Save work frequently — if session breaks, we can resume from last saved state
- Dates in article frontmatter: use format "YYYY-MM-DD"
- Date display on website: German format ("12. November 2025")
