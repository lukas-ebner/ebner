---
description: "Generate blog images via NanoBanana API in a consistent editorial style matching lukasebner.de. Creates hero images and section images for articles. Trigger: 'Bilder generieren', 'Blog-Bilder', 'generate images', 'Bild erstellen', 'Hero-Bild', 'Artikelbilder'."
---

# Generate Blog Images

Generate visually consistent blog images using the NanoBanana API (generate-2 model) via project script.

## Visual Style

All blog images for lukasebner.de follow this style:
- Professional editorial photography feel
- Clean, modern, minimal composition
- Muted warm tones with subtle orange accent (#F44900)
- Dark moody backgrounds, cinematic lighting
- Business/tech context, premium European feel
- NO text overlays, NO logos, NO stock-photo clichés
- NO people's faces (to avoid uncanny valley)

The style prefix is built into the script — just provide the subject.

## Workflow

1. **Read the article** to understand context and key visual moments
2. **Propose 2-3 image concepts**:
   - **Hero image** (required, 16:9, used as og:image and article header)
   - **Section images** (optional, for key sections, 3:2 or 16:9)
3. **Get user approval** on concepts
4. **Generate images** via script:
   ```bash
   cd /sessions/practical-tender-faraday/mnt/ebner && node scripts/blog/generate-image.mjs "<subject description>" --aspect 16:9 --resolution 2K --output public/images/blog/<slug>-hero.jpg
   ```
5. **Review results**: Show the generated image path, let user approve or regenerate
6. **Update article frontmatter** with image path:
   ```yaml
   image: /images/blog/<slug>-hero.jpg
   ```

## Image Naming Convention

- Hero: `<slug>-hero.jpg`
- Section images: `<slug>-01.jpg`, `<slug>-02.jpg`, etc.
- All saved to `public/images/blog/`

## Prompt Guidelines

Good prompts for this style:
- "Abstract visualization of business scaling, ascending geometric shapes, warm tones with orange highlights"
- "Minimal workspace with laptop showing code, dark wood desk, soft window light, architectural feel"
- "Abstract data flow visualization, dark background, glowing orange connection lines"

Bad prompts:
- "A businessman in a suit shaking hands" (stock photo cliché)
- "Happy diverse team in modern office" (generic)
- "Robot and human working together" (overused AI trope)

## CRITICAL: Always Show Concepts Before Generating

**Never generate an image without presenting the concepts to the user first.** Always:
1. Show 2-3 image concepts with detailed descriptions (what the image shows, mood, composition, key elements)
2. Wait for user to pick a concept
3. Generate only the selected concept
4. After generation, tell the user the file path so they can view the image in their browser (e.g. `localhost:3000/images/blog/<slug>-hero.jpg`)
5. Ask for approval — offer to regenerate with tweaks if needed

## Other Rules

- Hero image is mandatory for every article
- Generate at 2K resolution for quality
- The script polls until the image is ready (can take 30-60 seconds)
- Check image quality before updating frontmatter
- Images are saved locally — no CDN upload needed, Next.js serves from public/
