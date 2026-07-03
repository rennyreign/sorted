# Skill: Sorted Art Director

**Purpose:** Translate a business analysis into a deterministic creative direction for a Sorted website.

The Art Director is the bridge between the Website Analyser and the Site Composer. It does not generate code. It does not select components. It makes the creative decisions that every later layer inherits from:

- What brand personality should this business express?
- What visual language should it speak?
- What colour language should it use?
- What typography language should it use?
- What material language should give it physical presence?
- What photography doctrine should prove its trust?
- What composition grammar should guide the page?
- What is the single dominant impression the visitor should receive?

Without these decisions, the Site Composer defaults to safe, generic patterns. The Art Director prevents that.

---

## When to invoke

Invoke the Art Director immediately after the Website Analyser completes and before the Site Composer runs.

**Inputs:**
- `site_analysis.json` from the Website Analyser
- Any existing website screenshot or URL
- Known business category and location
- Existing client assets (logo, photos, copy) if available

**Output:**
- `creative_direction.json` — a structured creative brief consumed by the Site Composer

---

## Creative direction output schema

The Art Director produces a JSON object with this shape:

```json
{
  "business": {
    "name": "LRT Plumbing Services",
    "category": "trade",
    "subcategory": "plumbing",
    "location": "Warwickshire, Coventry, Rugby and Leamington Spa",
    "primary_conversion": "call_now",
    "trust_gap": "Will they answer quickly and fix it properly?"
  },
  "brand": {
    "personality": "reliable_local",
    "emotional_positioning": "capable, calm, available",
    "tone_of_voice": "direct, plain, reassuring",
    "differentiator": "24/7 local emergency response with fair pricing",
    "value_proposition": "Plumbing problems sorted fast, any time of day"
  },
  "visual_language": {
    "selected": "utility",
    "reason": "Trade business where clarity and speed of understanding matter more than editorial aspiration"
  },
  "colour_language": {
    "selected": "utility",
    "reason": "Functional blue reinforces water/trade competence and keeps the page clean and action-focused"
  },
  "typography_language": {
    "selected": "utility",
    "reason": "Bold, legible type supports scanning and fast decision-making in an emergency context"
  },
  "material_language": {
    "selected": "utility",
    "reason": "Clean surfaces, small shadows, and high contrast keep the interface functional and calm"
  },
  "photography": {
    "primary": "environmental_portrait",
    "secondary": "documentary",
    "reason": "Trust is built through the actual plumber and real work situations"
  },
  "assembly_selection": {
    "reason": "Emergency trade with speed trust gap. Phone-forward conversion. Strong work evidence available.",
    "assemblies": {
      "nav": "nav-standard",
      "hero": "hero-utility-split",
      "trust": "trust-stat-strip",
      "services": "services-3-cards",
      "proof": "proof-gallery-2",
      "process": "process-steps-3",
      "about": "about-split-credentials",
      "testimonials": "testimonials-featured",
      "cta": "cta-band-phone",
      "footer": "footer-standard"
    }
  },
  "composition": {
    "hero_type": "split",
    "hero_photography_weight": 55,
    "reading_rhythm": "high_intensity_low_intensity",
    "section_density": "low_to_medium",
    "dominant_impression": "a real local plumber who answers the phone",
    "sequence": ["nav", "hero", "trust", "services", "proof", "process", "about", "testimonials", "cta", "footer"]
  },
  "trust": {
    "primary_signals": ["24/7_availability", "local_coverage", "fast_response", "fair_pricing"],
    "placement": ["hero", "trust_strip", "services", "cta"]
  },
  "cta": {
    "primary": "Call 07379 176466",
    "secondary": "Book on WhatsApp",
    "tertiary": "View services"
  },
  "anti_patterns": [
    "Do not use stock bathroom interiors",
    "Do not make the hero taller than one viewport",
    "Do not use more than one accent colour"
  ]
}
```

---

## Required reading before deciding

Load these skills in this order and apply them as constraints:

1. `sorted-skills/00-foundations/01-human-psychology.md`
2. `sorted-skills/00-foundations/02-trust-engine.md`
3. `sorted-skills/00-foundations/03-visual-hierarchy.md`
4. `sorted-skills/00-foundations/04-sorted-site-principles.md`
5. `sorted-skills/01-brand/01-brand-doctrine.md`
6. `sorted-skills/01-brand/02-brand-tone-of-voice.md`
7. `sorted-skills/01-brand/03-brand-trust-signals.md`
8. `sorted-skills/01-brand/04-brand-value-proposition.md`
9. `sorted-skills/01-brand/05-brand-differentiation.md`
10. `sorted-skills/02-visual-language/01-vl-editorial.md`
11. `sorted-skills/02-visual-language/02-vl-utility.md`
12. `sorted-skills/02-visual-language/03-vl-lifestyle.md`
13. `sorted-skills/02-visual-language/04-vl-architectural.md`
14. `sorted-skills/03-photography/01-ph-doctrine.md`
15. `sorted-skills/03-photography/02-ph-documentary.md`
16. `sorted-skills/03-photography/03-ph-lifestyle.md`
17. `sorted-skills/03-photography/04-ph-architectural.md`
18. `sorted-skills/03-photography/05-ph-environmental-portrait.md`
19. `sorted-skills/04-composition/01-comp-doctrine.md`
20. `sorted-skills/04-composition/02-comp-hero.md`
21. `sorted-skills/04-composition/05-comp-viewport-mathematics.md`
22. `sorted-skills/04-composition/06-comp-section-pacing.md`
23. `sorted-skills/04-composition/07-comp-storytelling-rhythm.md`
24. `sorted-skills/05-motion/01-motion-doctrine.md`
25. `sorted-skills/06-components/01-component-specification.md`
26. `sorted-skills/06-components/02-component-hero.md`
27. `sorted-skills/06-components/03-component-trust-strip.md`
28. `sorted-skills/07-colour-language/01-cl-utility.md`
29. `sorted-skills/07-colour-language/02-cl-premium.md`
30. `sorted-skills/07-colour-language/03-cl-warm-human.md`
31. `sorted-skills/07-colour-language/04-cl-editorial.md`
32. `sorted-skills/08-typography-language/01-tl-utility.md`
33. `sorted-skills/08-typography-language/02-tl-editorial.md`
34. `sorted-skills/08-typography-language/03-tl-luxury.md`
35. `sorted-skills/08-typography-language/04-tl-minimal.md`
36. `sorted-skills/09-material-language/01-material-doctrine.md`
37. `sorted-skills/10-decision-language/01-decision-language.md`
38. `sorted-skills/11-assembly-library/INDEX.md`

---

## Decision procedure

### Step 1 — Identify the trust gap

Read the website analysis. Ask: what is the single biggest uncertainty a visitor has before contacting this business?

Examples:
- Plumber: "Will they come quickly and fix it properly?"
- Accountant: "Will they understand my business and keep me compliant?"
- Beauty salon: "Will I look good and feel comfortable?"
- Restaurant: "Will the food be worth the visit?"

The trust gap determines everything else.

### Step 2 — Select brand personality

Choose one dominant personality from the Sorted set:

- `reliable_local` — trusted, approachable, nearby
- `premium_specialist` — expert, refined, worth more
- `neighbourhood_expert` — known, established, community-rooted
- `luxury_boutique` — aspirational, exclusive, experience-led
- `fast_emergency` — immediate, responsive, urgent
- `technical_authority` — certified, precise, knowledgeable
- `family_business` — warm, personal, generations
- `modern_professional` — efficient, current, organised
- `established_heritage` — proven, longstanding, respected

Rules:
- One personality per site
- The personality must address the trust gap directly
- Never combine two personalities equally

### Step 3 — Select visual language

Map the brand personality to a visual language:

| Brand personality | Primary visual language | When to override |
|---|---|---|
| reliable_local | utility | high-end work or premium materials → editorial |
| premium_specialist | editorial | hands-on trade work → utility + editorial |
| neighbourhood_expert | lifestyle | professional services → architectural |
| luxury_boutique | editorial | spaces/experiences → architectural |
| fast_emergency | utility | always utility |
| technical_authority | architectural | customer-facing warmth → utility |
| family_business | lifestyle | long-established trade → utility |
| modern_professional | editorial | trades/construction → utility |
| established_heritage | architectural | hospitality → lifestyle |

### Step 4 — Select colour language

Map the visual language to a colour language:

| Visual language | Default colour language | Override |
|---|---|---|
| utility | utility | emergency trades may use a warmer accent |
| editorial | editorial | warm professional services → warm-human |
| lifestyle | warm-human | premium venues → premium |
| architectural | editorial | residential interiors → warm-human |

The colour language must reinforce the emotional promise of the brand personality.

### Step 5 — Select typography language

Map the visual language to a typography language:

| Visual language | Default typography language | Override |
|---|---|---|
| utility | utility | premium trade → editorial |
| editorial | editorial | minimalist architect → minimal |
| lifestyle | luxury | modern wellness → minimal |
| architectural | minimal | classic interiors → editorial |

Typography must support scanning if the business is urgent, and support reading if the business is considered.

### Step 6 — Select material language

Map the visual language to a material approach:

| Visual language | Default material |
|---|---|
| utility | utility — clean surfaces, small shadows, high contrast |
| editorial | editorial — restrained surfaces, tonal depth, minimal shadows |
| lifestyle | warm textures, soft shadows, organic gradients |
| architectural | flat surfaces, precise borders, material honesty |

Material must give the page physical presence without competing with content.

### Step 7 — Select photography doctrine

Choose the photography that proves the trust gap:

- If the trust gap is about the people → `environmental_portrait`
- If the trust gap is about the work being done → `documentary`
- If the trust gap is about the result or space → `architectural`
- If the trust gap is about experience or identity → `lifestyle`
- If the trust gap is about a product or object → `product`

A secondary photography style may be selected for supporting imagery.

### Step 8 — Select assemblies from the Decision Language

Use `sorted-skills/10-decision-language/01-decision-language.md` to select the assemblies for each page section.

The Decision Language maps:

- `business_class` → assembly families
- `trust_gap` → trust assembly
- `brand_personality` → visual language + hero assembly
- `primary_conversion` → CTA assemblies
- `photography_strength` → proof assembly
- `content_richness` → testimonial assembly

Output an `assembly_selection` object with one assembly ID per section. Every ID must exist in `sorted-skills/11-assembly-library/INDEX.md`.

Example for LRT Plumbing:

```json
{
  "assembly_selection": {
    "reason": "Emergency trade with speed trust gap. Phone-forward conversion. Strong work evidence available.",
    "assemblies": {
      "nav": "nav-standard",
      "hero": "hero-utility-split",
      "trust": "trust-stat-strip",
      "services": "services-3-cards",
      "proof": "proof-gallery-2",
      "process": "process-steps-3",
      "about": "about-split-credentials",
      "testimonials": "testimonials-featured",
      "cta": "cta-band-phone",
      "footer": "footer-standard"
    }
  }
}
```

### Step 9 — Select composition approach

Use the selected assemblies to define the page composition:

- Arrange the assemblies in order of narrative intensity
- Assign a background and intensity to each assembly based on `sorted-skills/04-composition/06-comp-section-pacing.md`
- Ensure no two adjacent sections share the same intensity
- Ensure the hero is the most visually dominant section, or tied only with the final CTA

The composition does not invent new layouts. It sequences and configures the selected assemblies.

### Step 10 — Select CTA hierarchy

Primary CTA must match the primary conversion from the analysis:

- `call_now` → phone number as primary
- `book_intro` → booking button as primary
- `request_quote` → quote form/button as primary
- `visit_shop` → address/directions as primary
- `order_online` → order button as primary
- `join_class` → sign-up button as primary
- `WhatsApp` → WhatsApp button as primary

Secondary and tertiary CTAs must not compete with the primary.

The CTA hierarchy must be consistent with the selected CTA assembly from Step 8.

### Step 11 — Define anti-patterns

List the specific things this site must not do. These should be derived from the brand personality and industry.

Examples for trade:
- Do not use stock bathroom interiors
- Do not use corporate handshake photography
- Do not make the hero taller than one viewport
- Do not use decorative gradients
- Do not bury the phone number

---

## Validation checks

Before producing the output, verify:

- [ ] The brand personality directly addresses the trust gap
- [ ] The visual language is compatible with the brand personality
- [ ] The colour language reinforces the emotional promise
- [ ] The typography language supports the right reading behaviour
- [ ] The material language gives the page physical presence without competing with content
- [ ] The photography doctrine can prove the trust gap visually
- [ ] The assembly selection is justified by business_class, trust_gap, and primary_conversion
- [ ] Every selected assembly ID exists in the Assembly Library INDEX
- [ ] The composition approach sequences the selected assemblies into a coherent narrative
- [ ] The CTA hierarchy matches the primary conversion and the selected CTA assembly
- [ ] Every anti-pattern is derived from the brand or industry
- [ ] The output does not contradict any foundation principle

---

## Integration with the pipeline

```
Website Analyser
  ↓
Art Director → creative_direction.json
  ↓
Site Composer → composition.json
  ↓
Asset Generator → assets/ + manifest.json
  ↓
Frontend Builder → rendered site
```

The Art Director must not duplicate work that belongs to the Website Analyser or Site Composer. Its only job is creative direction.

---

## Notes

- The Art Director may override empirical defaults if the business analysis strongly supports it.
- The Art Director should not invent visual styles. It selects from the existing Sorted design language.
- Every decision must be explainable in one sentence.
