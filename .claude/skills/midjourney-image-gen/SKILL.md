---
name: midjourney-image-gen
description: |
  Generate images via Midjourney's web interface using browser automation. Navigates to midjourney.com/imagine, types prompts, submits them, and monitors generation progress. Supports two proven style presets: Leica M6 black-and-white documentary photography and abstract impressionist oil paintings. Use this skill whenever the user wants to generate images, create visuals for a website, produce hero images, section images, portraits, or illustrations via Midjourney. Also trigger when the user says "Midjourney", "Bild generieren", "generate image", "erstell ein Bild", "Foto generieren", or wants to create visual assets for any page or project.
---

# Midjourney Image Generation via Browser

This skill automates image generation through Midjourney's web UI at `https://www.midjourney.com/imagine`. It uses Chrome browser tools to type prompts, submit them, and monitor progress.

## Prerequisites

- The user must be logged into Midjourney in their browser
- Chrome browser tools (Claude in Chrome) must be available
- The user's Midjourney plan must have available GPU minutes

## Workflow

### 1. Get browser context

```
tabs_context_mcp(createIfEmpty: true)
```

If there's no tab on Midjourney yet, create one:
```
tabs_create_mcp()
navigate(url: "https://www.midjourney.com/imagine", tabId: <new-tab>)
wait(duration: 5)  // Midjourney is heavy, give it time to load
```

### 2. Build the prompt

Every prompt has two parts: the **scene description** and the **style suffix**. The scene is what you're depicting. The suffix controls the visual style and Midjourney parameters.

#### Style: Leica M6 Black & White Documentary

This is the primary style for lukasebner.de — editorial, raw, authentic. Think Berlin startup loft, not Manhattan corporate office.

**Prompt pattern:**
```
Portrait photography in black and white, [SCENE DESCRIPTION], one person aged 30-40, [SETTING — use Berlin/startup/loft aesthetics], [EMOTION/ACTION], documentary photography style, candid moment, [SPECIFIC HUMAN QUALITY e.g. "genuine human exhaustion"], pure monochrome photography, analog film grain texture, Tri-X 400 pushed, slight motion blur, imperfect focus, natural skin texture, unretouched photography, photojournalistic style, Leica M6 aesthetic, shallow depth of field, ambient light only, gritty urban realism
```

**Parameter suffix:** `--chaos 20 --ar [RATIO] --s 150 --v 7`

**Key learnings (from real iterations):**
- ALWAYS specify "Berlin creative startup aesthetic" or "startup loft" — without it, Midjourney defaults to corporate NYC/London stock-photo look
- "exposed brick walls", "cluttered desk", "post-it notes", "messy living room" — these texture details make the difference between authentic and sterile
- Use "aged 30-40" not "aged 35-45" — the younger range reads more founder/startup
- Include a specific human quality: "genuine human exhaustion", "genuine human defeat", "genuine human overwhelm" — this steers the facial expression
- Add "candid moment" — prevents posed/portrait-studio looks
- NEVER use "corporate", "executive", "conference room", "skyline" — instant stock photo vibes

**Aspect ratios:**
- `--ar 2:1` — panorama landscapes, section images, hero banners
- `--ar 3:2` — standard editorial, blog images
- `--ar 1:1` — square, for circular crops or thumbnails
- `--ar 9:16` — vertical/portrait, for mobile or LinkedIn

#### Style: Abstract Impressionist Oil Painting

For metaphorical/conceptual illustrations. Works best with surreal or exaggerated scenes (animals in suits, impossible scenarios).

**Prompt pattern:**
```
[SCENE DESCRIPTION with surreal/metaphorical elements]. abstract impressionist oil painting, soft light and painterly brushstrokes, warm colors, vibrant palette, illustration style: raw and midjourney v7
```

**Parameter suffix:** `--chaos 20 --ar [RATIO] --s 150 --v 7`

**Key learnings:**
- Works great for metaphors: octopus juggling phones, Sisyphus with a boulder, hamster wheel
- Include specific details that make the metaphor concrete: "the boulder has laptops embedded in it"
- "warm colors" and "vibrant palette" prevent the dark/muddy results that happen with `--raw --stylize 0`
- Do NOT use `--raw` or `--stylize 0` — these remove too much control and results become unpredictable

### 3. Submit the prompt

```
// Click the prompt input field (centered at top of page)
left_click(coordinate: [645, 25], tabId: <tab>)

// Type the full prompt including parameters
type(text: "<full prompt with --parameters>", tabId: <tab>)

// Submit
key(text: "Return", tabId: <tab>)

// Wait briefly before submitting next prompt
wait(duration: 3)
```

### 4. Monitor progress

After submitting, wait and take screenshots to monitor:

```
wait(duration: 10)
screenshot(tabId: <tab>)
```

Midjourney shows a "X% Complete" badge on generating images. Each prompt produces 4 variations. Generation typically takes 30-60 seconds.

### 5. Batch submissions

When generating multiple images, submit all prompts in sequence (with 3-second gaps), then monitor. Don't wait for each one to complete before submitting the next — Midjourney queues them automatically.

### 6. Selecting and downloading results

After generation is complete:
- Each prompt produces 4 image variations in a 2x2 grid
- Click on a specific image to open it full-size
- The user can then upscale, vary, or download from there
- To download: click the image, then use the download button in the detail view

## Common parameter reference

| Parameter | Values | Purpose |
|-----------|--------|---------|
| `--v 7` | 5, 6, 7 | Model version. Always use 7 (latest, best quality) |
| `--ar` | 1:1, 2:1, 3:2, 16:9, 9:16 | Aspect ratio |
| `--s` | 0-1000 | Stylization. 0=raw, 150=balanced, 1000=very styled |
| `--chaos` | 0-100 | Variation between the 4 results. 20=good variety |
| `--raw` | flag | Reduces Midjourney's beautification. Avoid for most use cases |
| `--q` | .25, .5, 1 | Quality/detail level. Default 1 is fine |

#### Style: Leonardo AI — Trained Face / Personal Branding

For images where Lukas appears directly (trained model). Ideal for parallax backgrounds, about-me sections, editorial shots with his actual face. Leonardo AI renders the trained face; prompt style controls setting and mood.

**Prompt pattern:**
```
A man in his late 30s, short dark hair and glasses, [ACTION/POSE], [SETTING with specific environmental details], [WARDROBE — black t-shirt, casual, no suit], [LIGHTING — natural/editorial, never flash], [MOOD/EXPRESSION — thoughtful, focused, not smiling at camera], muted tones with warm highlights, editorial photography style, Leica lens look, 35mm focal length
```

**Negative prompt (always include):**
```
corporate stock photo, suit and tie, generic office, overly posed, smiling at camera, bright saturated colors, HDR, artificial lighting, cluttered background
```

**Recommended settings:**
- Aspect Ratio: **16:9** or **2:1** (set via UI dimension controls, not in prompt)
- Guidance Scale: **7–8** (keeps face natural, not over-baked)
- Model: Phoenix or latest available
- Use "Photography" preset if available

**Key learnings:**
- Leonardo doesn't use `--ar` syntax like Midjourney — aspect ratio is set in the **Image Dimensions** panel (slider or presets like 16:9, 3:2, etc.)
- For parallax backgrounds: choose widest landscape ratio available. The image needs to work with a 60% black overlay on top, so it needs contrast/structure but shouldn't be too busy
- Describe the setting in detail (whiteboard with diagrams, laptop screens, coffee cups) — this gives texture without competing with the text overlay
- "looking slightly off-camera" prevents the portrait-stare problem
- Always specify "no suit" or "black t-shirt" — Leonardo defaults to business attire
- Berlin/loft aesthetics work here too: "exposed concrete ceiling", "warm pendant lights", "modern co-working space"
- Never say "photorealistic" — it triggers uncanny-valley rendering. "Editorial photography style" gets better results

**Use cases:**
- Parallax-story background images on lukasebner.de
- About-me / profile shots with specific settings
- Meeting/workshop scenes with Lukas as recognizable subject
- Any image where the trained face must be consistent

**Example prompts:**

Parallax background — system architecture:
```
A man in his late 30s, short dark hair and glasses, standing in front of a large glass whiteboard covered in system architecture diagrams, flowcharts and connected nodes, shallow depth of field with the diagrams softly blurred in the background, natural side lighting from floor-to-ceiling windows, modern Berlin startup loft with exposed concrete ceiling and warm pendant lights, black t-shirt, thoughtful expression looking slightly off-camera, muted tones with warm highlights, editorial photography style, Leica lens look, 35mm focal length
```

Parallax background — meeting scene:
```
A man in his late 30s, short dark hair and glasses, sitting at the head of a long wooden table in a loft-style meeting room, three other people visible from behind out of focus, mid-conversation gesturing with one hand, natural daylight from large industrial windows, exposed brick wall in background, papers and laptops on the table, black t-shirt, focused expression, muted warm tones, editorial photography style, Leica lens look, 35mm focal length
```

Parallax background — working late:
```
A man in his late 30s, short dark hair and glasses, sitting alone at a desk late at night, single desk lamp casting warm pool of light, multiple monitor screens glowing softly in background, modern minimalist home office, black t-shirt, deep concentration looking at screen, muted tones with warm lamp highlights, editorial photography style, Leica lens look, 50mm focal length
```

## Anti-patterns (things that don't work)

- `--raw --stylize 0` together = unpredictable, dark, muddy results
- `--v 6` with v7 available = older model, worse results
- "corporate office", "executive", "business meeting" = instant stock photo
- Too-abstract scene descriptions without concrete details = blob art
- Missing setting/location context = Midjourney picks generic/American defaults

## Example prompts

### Leica portrait — founder working late
```
Portrait photography in black and white, male founder sitting alone at a long messy table covered in papers and coffee cups, one person aged 30-40, empty chairs all around him, he is the only one left working late, exhausted expression rubbing his eyes, Berlin creative startup loft space, exposed brick walls, natural window lighting from the side, documentary photography style, candid moment, pure monochrome photography, analog film grain texture, Tri-X 400 pushed, slight motion blur, imperfect focus, natural skin texture, unretouched photography, photojournalistic style, Leica M6 aesthetic, shallow depth of field, ambient light only, gritty urban realism --chaos 20 --ar 2:1 --s 150 --v 7
```

### Leica portrait — chaotic team meeting
```
Portrait photography in black and white, male founder aged 30-40 standing at a whiteboard trying to explain something to a crowded small room of young employees, everyone talking over each other, hands raised, chaotic energy, too many people in a tiny startup loft, Berlin creative workspace aesthetic, open plan office, documentary photography style, candid moment, genuine human overwhelm, pure monochrome photography, analog film grain texture, Tri-X 400 pushed, slight motion blur, imperfect focus, natural skin texture, unretouched photography, photojournalistic style, Leica M6 aesthetic, shallow depth of field, ambient light only, gritty urban realism --chaos 20 --ar 2:1 --s 150 --v 7
```

### Oil painting — octopus metaphor
```
A very busy octopus in a suit in an office chair giving customer support. In his many tentacles he has Phones, documents, he is typing and working frantically. in the background is an office space. abstract impressionist oil painting, soft light and painterly brushstrokes, warm colors, vibrant palette, illustration style: raw and midjourney v7 --chaos 20 --ar 3:2 --s 150 --v 7
```
