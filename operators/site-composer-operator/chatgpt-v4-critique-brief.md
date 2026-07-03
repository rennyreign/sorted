# ChatGPT Brief — Critique LRT Plumbing v4 and Propose Skill Updates

## Context

We are building a **design language + art director system** for Sorted, a website manufacturing line for small local businesses. The system uses a layered skill library to turn a business analysis into a finished website without manual mockups.

The layers are:

```
00-foundations       — human psychology, trust engine, visual hierarchy, sorted principles
01-brand             — brand personality, tone of voice, trust signals, value prop, differentiation
02-visual-language   — editorial, utility, lifestyle, architectural
03-photography       — documentary, lifestyle, architectural, environmental portrait, product
04-composition       — hero, reading rhythm, density, viewport mathematics, section pacing
05-motion            — motion doctrine, page transitions, micro-interactions, scroll behaviour
06-components        — hero, trust strip, services, process, about, testimonials, cta, footer
```

An **Art Director skill** now sits at the top of the pipeline and translates business analysis into a `creative_direction.json`. The v4 site below was generated using that system.

## Current site

**Business:** LRT Plumbing Services — local plumbing contractor covering Warwickshire, Coventry, Rugby and Leamington Spa.

**Creative direction used:**
- Brand personality: `fast_emergency`
- Visual language: `utility`
- Photography: `environmental_portrait` + `documentary`
- Trust signals: 24/7, local coverage, fast response, fair pricing, real work photos
- Primary CTA: call now

**Local URL:** http://localhost:3101
**Output directory:** `operators/site-composer-operator/output/lrt-plumbing-site-v4/`

## Your job

I want you to act as the **Design Director** reviewing the generated site.

Score it out of 10. Current internal score is **6/10**. It is professional, clean, and structurally sound, but it lacks **personality, taste, flavour, and depth**.

The goal is to get to **8 or 9/10** — a site that feels like a real designed brand, not a clean template.

Please critique the site and translate every critique into a **specific skill-layer update**. The next pass will apply your suggestions directly to the design language skills, so your output must be actionable, not vague.

## Focus areas

Look at the screenshot and the site (if accessible) and critique across these areas. Do not comment on every area if there is nothing to say — focus on what would most improve the score.

### 1. Colour
- Is the palette interesting, or just safe?
- Does it feel right for a plumbing emergency service?
- Is there enough tonal depth, or is it flat?
- What should the accent colour be and how should it be used?

### 2. Typography
- Does the type feel designed or default?
- Is there enough contrast between headline and body?
- Should there be a second font? When and why?
- How should numbers, labels, and CTAs be treated?

### 3. Photography / imagery
- Does the hero image create the right impression?
- Is the image treatment consistent and intentional?
- What specific art direction should apply to the plumber photos?
- Are there enough images, or too many/too few?

### 4. Layout and composition
- Is the page rhythm interesting or predictable?
- Does the hero feel dominant and confident?
- Are sections too similar to each other?
- Where could asymmetry, scale, or whitespace improve the design?

### 5. Texture and depth
- Does the site feel flat or layered?
- Where could subtle gradients, shadows, borders, or background shifts add quality?
- How should dark and light sections alternate?

### 6. Motion and interaction
- Is there enough motion to feel alive, without being gimmicky?
- What micro-interactions would make the site feel more premium?
- What should animate on scroll, hover, or page load?

### 7. Copy and voice
- Does the copy sound like a real local plumber, or generic marketing text?
- Where does the headline or supporting copy feel flat?
- What specific phrases would improve trust or personality?

### 8. Components and details
- Does the nav feel premium?
- Does the trust bar look like a designed element or a row of icons?
- Do the service cards feel too generic?
- Does the CTA section close the page with confidence?

## Output format

For each critique, use this exact format:

```markdown
## [Area] — [one-line summary]

### Current problem
[What looks wrong or generic]

### Why it matters
[How it affects trust, conversion, or perceived quality]

### Design principle
[The rule this should follow]

### Skill layer
[00-foundations / 01-brand / 02-visual-language / 03-photography / 04-composition / 05-motion / 06-components]

### Proposed skill update
[Exact guidance to add to the relevant skill file. Be specific enough that a code-generation agent can follow it.]

### Validation check
[How we will know the next pass fixed it — e.g. "Hero background has a subtle gradient", "Accent colour appears only on interactive elements and CTAs"]
```

## Top-level output

At the end, also provide:

1. **New score prediction** — if the proposed changes are applied, what score would the site reach?
2. **Priority ranked list** — which 3–5 changes will have the biggest impact?
3. **Any missing skill layers** — do we need new skills beyond the 7 layers above? (e.g. `07-colour-language`, `08-typography-language`, `09-texture-and-depth`)

## Important constraints

- The site must remain **functional and conversion-focused**. Phone number must stay visible. Emergency availability must stay clear.
- The site is **static HTML generated by an agent**, so suggestions should be implementable through CSS, component variants, and asset generation prompts.
- Do not propose complex CMS, backend, or interactive features.
- Avoid purely subjective preferences. Every critique should connect to trust, conversion, or brand impression.

## Goal

I want to paste your output into a design skill file and then run the site again. The next version should feel meaningfully more designed, more trustworthy, and more specific to a local emergency plumber.
