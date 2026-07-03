# Skill: design-composer

**Type:** Sub-skill — visual and structural design reasoning
**Trigger:** Loaded by `site-composer` after the Art Director has produced `creative_direction.json`
**Input:** `creative_direction.json`, business analysis, website screenshot, business context
**Output:** `design_doctrine` + `visual_tokens` + `section_archetypes` + `asset_briefs` inside `composition.json`

---

## What this skill does

The Design Composer is the visual thinking layer of the Site Composer. It decides what the site will look like, how it will feel, and how the page will move a visitor from arrival to action.

It does not write code. It produces structured design decisions that the Site Composer folds into `composition.json` so downstream operators can render them deterministically.

This skill is the operational equivalent of what a human designer does when looking at a business and deciding: colour palette, typography, section order, image style, trust signals, and CTA rhythm.

---

## When to load

Load this skill when the Site Composer needs to reason about:

- The visual character of the site
- The section order and layout rhythm
- The colour palette and typography
- The style of photography or illustration
- The trust signals and conversion devices
- The component patterns for each section

Do not load this skill if a manual mockup already exists. In that case, use `mockup-deconstructor` instead.

---

## Design philosophy

Every Sorted site must feel:

- **Obvious** — the visitor knows what to do within 5 seconds
- **Useful** — every section earns its place
- **Trustworthy** — the business looks credible, local, and real
- **Frictionless** — the path to contact or booking is easy
- **Local** — it feels like a nearby business, not a remote agency
- **Human** — real people, real work, real language
- **Competent** — clean execution, no broken details
- **Polished** — professional finish without being overdesigned

These qualities come from decisions, not decoration. The Design Composer makes those decisions explicit.

---

## Empirical defaults from the Sorted mockup library

The mockup library was analysed across 45 existing Sorted mockups. Use these as defaults unless the business analysis overrides them.

### Business class distribution

| Class | Share | Typical conversion |
|---|---|---|
| food | 42% | book a table / order online |
| professional_service | 20% | request quote / get in touch |
| beauty | 18% | book appointment |
| hospitality | 9% | book a table |
| fitness | 2% | book intro |
| local_service / trade | 2% | call now |
| education / other | 7% | book intro / join class |

### Archetype defaults by class

| Class | Hero | Services | Trust | Testimonials | Contact | Style |
|---|---|---|---|---|---|---|
| food | hero_centered | service_cards_image | none | none | cta_band | premium |
| professional_service | hero_centered | service_cards_image | trust_bar | testimonial_cards | cta_band | light |
| beauty | hero_centered | service_cards_image | none | none | cta_band | premium |
| hospitality | hero_centered | feature_list | none | none | cta_split | light |
| fitness | hero_full_bleed | service_cards_image | trust_bar | none | cta_band | dark |
| local_service / trade | hero_centered | service_cards_image | trust_bar | testimonial_quote | cta_band | light |

### Overall defaults

- **Hero:** `hero_centered` (70% of mockups), `hero_full_bleed` (30%)
- **Services:** `service_cards_image` (75% of mockups)
- **Trust:** `trust_bar` (50%) or `none` (40%)
- **Testimonials:** `none` (45%), `testimonial_cards` (30%), `testimonial_quote` (25%)
- **Contact:** `cta_band` (70%)
- **Style:** light (40%), premium (30%), warm (20%), mixed (10%), dark (rare)

### Default section order

The most common full pattern is:

```
nav → hero → trust_bar → services → about → testimonials → cta → footer
```

Use this as the starting point. Move `about` before `services` if the founder story is central to trust (common in beauty and hospitality). Remove `testimonials` if none are available.

### Common trust signals

Ranked by frequency in the mockup library:

1. local_coverage
2. reviews
3. certifications
4. years_experience
5. fair_pricing

### Common primary CTA labels

- Food: "Book a table"
- Beauty: "Book appointment" / "Book now"
- Professional services: "Get a quote" / "Book a valuation" / "Get in touch"
- Trade / local service: "Call now"
- Fitness: "Book a free intro"

---

## Step 0 — Read the creative direction

The Art Director has already made the high-level creative decisions. Read `creative_direction.json` first.

From it, extract:

- `brand.personality` — the dominant brand personality
- `visual_language.selected` — the chosen visual language
- `colour_language.selected` — the chosen colour language
- `typography_language.selected` — the chosen typography language
- `material_language.selected` — the chosen material approach
- `photography.primary` — the main photography doctrine
- `composition.hero_type` — the hero layout approach
- `composition.dominant_impression` — the single feeling the site must create
- `trust.primary_signals` — the ranked trust signals
- `cta.primary`, `cta.secondary`, `cta.tertiary` — the action hierarchy
- `anti_patterns` — the specific things to avoid

All subsequent design decisions must inherit from these. The Design Composer's job is not to re-decide the creative direction. It is to translate the creative direction into concrete visual tokens, section archetypes, and asset requirements.

When selecting colours, typography, material, and component details, load the relevant files from `sorted-skills/07-colour-language/`, `sorted-skills/08-typography-language/`, and `sorted-skills/09-material-language/`.

If `creative_direction.json` is missing, fall back to the empirical defaults in the section below and the business class from the analysis.

---

## Empirical defaults from the Sorted mockup library

Use these defaults only when the Art Director has not provided a decision or when the business analysis contradicts the creative direction.

### Business class distribution

| Class | Share | Typical conversion |
|---|---|---|
| food | 42% | book a table / order online |
| professional_service | 20% | request quote / get in touch |
| beauty | 18% | book appointment |
| hospitality | 9% | book a table |
| fitness | 2% | book intro |
| local_service / trade | 2% | call now |
| education / other | 7% | book intro / join class |

### Archetype defaults by class

| Class | Hero | Services | Trust | Testimonials | Contact | Style |
|---|---|---|---|---|---|---|
| food | hero_centered | service_cards_image | none | none | cta_band | premium |
| professional_service | hero_centered | service_cards_image | trust_bar | testimonial_cards | cta_band | light |
| beauty | hero_centered | service_cards_image | none | none | cta_band | premium |
| hospitality | hero_centered | feature_list | none | none | cta_split | light |
| fitness | hero_full_bleed | service_cards_image | trust_bar | none | cta_band | dark |
| local_service / trade | hero_centered | service_cards_image | trust_bar | testimonial_quote | cta_band | light |

### Overall defaults

- **Hero:** `hero_centered` (70% of mockups), `hero_full_bleed` (30%)
- **Services:** `service_cards_image` (75% of mockups)
- **Trust:** `trust_bar` (50%) or `none` (40%)
- **Testimonials:** `none` (45%), `testimonial_cards` (30%), `testimonial_quote` (25%)
- **Contact:** `cta_band` (70%)
- **Style:** light (40%), premium (30%), warm (20%), mixed (10%), dark (rare)

### Default section order

The most common full pattern is:

```
nav → hero → trust_bar → services → about → testimonials → cta → footer
```

Use this as the starting point. Move `about` before `services` if the founder story is central to trust (common in beauty and hospitality). Remove `testimonials` if none are available.

### Common trust signals

Ranked by frequency in the mockup library:

1. local_coverage
2. reviews
3. certifications
4. years_experience
5. fair_pricing

### Common primary CTA labels

- Food: "Book a table"
- Beauty: "Book appointment" / "Book now"
- Professional services: "Get a quote" / "Book a valuation" / "Get in touch"
- Trade / local service: "Call now"
- Fitness: "Book a free intro"

---

## Step 1 — Read the business signals

Before choosing anything, extract the signals that should drive the design:

### Business class

From the analysis, assign the business class:

| Class | Mood | Visual cues |
|---|---|---|
| Trade / repair | Reliable, fast, capable | Bold accent, real work photos, phone-forward |
| Local service | Friendly, established, tidy | Clean layout, warm neutral, team/vehicle photos |
| Fitness / wellness | Energised, calm, focused | Dark or high-contrast, portrait photography, action shots |
| Beauty / personal care | Warm, refined, inviting | Soft palette, detail shots, portrait-led |
| Food / hospitality | Warm, appetite-led, social | Rich imagery, open spaces, warm tones |
| Professional service | Calm, credible, clear | Restrained palette, clean typography, credentials |
| Booking-led | Simple, reassuring, urgent | Clear steps, prominent booking, trust signals |
| Trust-led | Proven, reassuring, local | Reviews, badges, stats, real faces |

### Primary conversion

The conversion action drives the CTA hierarchy:

- `call_now` — phone must be visible everywhere, especially nav and hero
- `book_intro` — form or booking CTA must be primary
- `request_quote` — quote form or clear pricing path
- `visit_shop` — location and opening hours must be prominent
- `WhatsApp` — chat button is secondary or primary
- `order_online` — product/service entry must be obvious

### Existing brand signals

If the existing website has usable brand signals, extract them:

- Logo shape / colour / style
- Existing brand colours (if any)
- Photography style (if any real photos exist)
- Tone of current copy
- Existing trust badges or accreditations

If the existing brand is weak or generic, discard it and design from the business class instead.

---

## Step 2 — Choose the design system

### Design archetype

Use the visual language from `creative_direction.json` to select the archetype. Utility becomes Clean local or Bold trust. Editorial becomes Premium or Minimal editorial. Lifestyle becomes Warm hospitality. Architectural becomes Premium or Minimal editorial.

Pick one archetype for the whole site. Do not mix.

| Archetype | Best for | Character |
|---|---|---|
| **Clean local** | Most trades and local services | Light background, strong accent, real photography, lots of white space |
| **Premium** | Food, beauty, professional services | Light background, refined accents (gold, navy, deep red), elegant typography, image-led cards |
| **Warm hospitality** | Food, beauty, venues | Warm neutrals, rich imagery, rounded corners, soft shadows |
| **Bold trust** | Emergency trades, builders, cleaners | Bold primary colour, big type, stat bars, badges, phone-forward |
| **Dark professional** | Fitness, premium trades, consulting | Dark background, high-contrast, editorial typography, portrait-led |
| **Minimal editorial** | Professional services, photographers | Restrained palette, asymmetric layouts, large typography, subtle motion |

Default for most Sorted builds: **Premium** (most common in the mockup library) or **Clean local**.

### Palette structure

Use the colour language from `creative_direction.json` to define the palette.

- `utility` → `sorted-skills/07-colour-language/01-cl-utility.md`
- `premium` → `sorted-skills/07-colour-language/02-cl-premium.md`
- `warm-human` → `sorted-skills/07-colour-language/03-cl-warm-human.md`
- `editorial` → `sorted-skills/07-colour-language/04-cl-editorial.md`

Every composition must define a complete palette. The values below are an example for a utility site:

```json
{
  "visual_tokens": {
    "palette": {
      "background": "#FFFFFF",
      "background_alt": "#F8FAFC",
      "background_dark": "#0F172A",
      "text": "#0F172A",
      "text_secondary": "#475569",
      "text_inverse": "#FFFFFF",
      "accent": "#2563EB",
      "accent_hover": "#1D4ED8",
      "border": "#E2E8F0",
      "success": "#16A34A",
      "warning": "#EAB308"
    }
  }
}
```

Rules:

- Max 1 accent colour.
- Never use pure black (#000000) for text.
- Backgrounds should be white or very light grey.
- Dark sections should use the same dark background colour, not a different shade every time.
- Accent saturation should be moderate — not neon.
- Accent colour must reinforce the emotional meaning of the brand personality.

### Typography

Use the typography language from `creative_direction.json` to define the type system.

- `utility` → `sorted-skills/08-typography-language/01-tl-utility.md`
- `editorial` → `sorted-skills/08-typography-language/02-tl-editorial.md`
- `luxury` → `sorted-skills/08-typography-language/03-tl-luxury.md`
- `minimal` → `sorted-skills/08-typography-language/04-tl-minimal.md`

Default Sorted stack for utility builds:

- Display / headings: Plus Jakarta Sans
- Body: Plus Jakarta Sans
- Labels / mono accents: DM Mono

Headline scale:

- H1 / hero: `clamp(3rem, 8vw, 7rem)`
- H2 / section: `clamp(2rem, 4vw, 3.5rem)`
- H3 / card: `text-xl` to `text-2xl`
- Body: `text-base leading-relaxed max-w-[65ch]`
- Label / eyebrow: `text-xs uppercase tracking-[0.15em]`

### Material treatment

Use the material language from `creative_direction.json` to define surfaces, shadows, gradients, and depth.

Load `sorted-skills/09-material-language/01-material-doctrine.md`.

Apply material rules to:

- Section background transitions
- Card elevation and shadows
- Hero overlays and gradients
- Button hover states
- Navigation bar treatment (glass, solid, or subtle)
- Trust strip separation from hero

Material must give the page physical presence without competing with content.

### Spacing and rhythm

Spacing is a system, not a suggestion. Every section must use the same scale.

#### Section padding

Use **one of these four values** per section. Do not invent others.

| Section type | Mobile | Tablet | Desktop |
|---|---|---|---|
| Massive (hero, final CTA) | `py-20` | `py-24` | `py-32` |
| Large (work proof, featured section) | `py-16` | `py-20` | `py-24` |
| Medium (services, about) | `py-16` | `py-20` | `py-24` |
| Compressed (trust strip, process) | `py-10` | `py-12` | `py-16` |

#### Content container

- `max-w-[1400px]`
- `mx-auto`
- `px-6 sm:px-10 lg:px-16`

Every section must use the same container.

#### Section title spacing

- Title block margin-bottom: `mb-10 md:mb-12`
- Label to heading gap: `mt-2`
- Heading to body gap: `mt-3 md:mt-4`

#### Heading sizes

| Level | Scale | Weight |
|---|---|---|
| H1 / hero | `clamp(3rem, 8vw, 7rem)` | bold |
| H2 / section | `clamp(2rem, 4vw, 3rem)` | bold |
| H3 / card | `text-lg md:text-xl` | semibold |
| H4 / step | `text-base` | semibold |

Do not use `font-extrabold` outside the hero. Do not use `clamp(2rem,4vw,3.5rem)`.

#### Grid gaps

- Cards: `gap-6 md:gap-8`
- Two-column splits: `gap-8 lg:gap-12`
- Icon rows: `gap-6 lg:gap-8`

#### Card padding

- Standard cards: `p-6`
- Featured cards: `p-6 sm:p-8`

#### Text measure

- Body paragraphs: `max-w-[60ch]`
- Descriptions: `max-w-[55ch]`
- Captions: `max-w-[65ch]`

#### Spacing rules

- Never use `mb-16` or larger for a section title block.
- Never use `py-28` or larger unless it is the hero.
- Never mix centered and left-aligned section titles on the same page.
- If the page has left-aligned titles, all titles must be left-aligned.
- If the page has centered titles, all titles must be centered.
- Utility sites default to left-aligned titles.

---

## Step 3 — Compose the page

### Default page archetypes

Use one of these as the starting skeleton. Do not invent from scratch.

#### Local service / trade

1. Nav — logo, links, phone, CTA
2. Hero — headline + primary CTA + local proof + main image
3. Trust bar — 3-4 trust signals (24/7, local, fast, fair)
4. Services — 3 service cards with clear outcomes
5. Process — 3 steps to remove anxiety
6. About — credentials, coverage, real work photo
7. Testimonials — 2-3 customer reviews with locations
8. Final CTA — phone + reassurance
9. Footer — links, contact, legal

#### Booking-led

1. Nav
2. Hero — book CTA + why book
3. Services — what can be booked
4. How it works — 3 steps
5. Trust / proof — stats, reviews, credentials
6. FAQ — objections
7. Contact / location
8. Footer

#### Trust-led

1. Nav
2. Hero — trust-led headline + CTA
3. Social proof — reviews, ratings, badges
4. Services or offerings
5. Credentials / certifications
6. Process / guarantee
7. Testimonials
8. Contact
9. Footer

#### Food / hospitality

1. Nav
2. Hero — atmosphere + booking CTA
3. Quick info — hours, location, phone
4. Menu / services / rooms
5. Gallery / atmosphere
6. About / story
7. Testimonials
8. Booking CTA
9. Footer

### Section ordering principles

- Hero first. Always.
- Trust comes before services when the visitor is anxious (emergency, repair, health).
- Services come before trust when the visitor is browsing (beauty, food, professional).
- About comes after the visitor understands what is offered.
- Testimonials work best after about, before the final CTA.
- Final CTA should be the last content section before the footer.

### Section archetypes

For each section, choose an archetype from the component library. The archetype defines the layout, not the styling.

Examples:

- `hero_split` — text left, image right
- `hero_centered` — text over full-bleed image
- `hero_utility` — text left, phone/form card right
- `trust_bar` — horizontal stats or icons
- `service_cards` — 3-column cards with icons
- `service_cards_image` — 3-column cards with images
- `process_steps` — numbered horizontal steps
- `about_split` — image left, text right
- `testimonial_cards` — 3 cards with avatars
- `testimonial_quote` — one large quote
- `cta_band` — full-width band with centred CTA
- `cta_split` — details left, CTA right
- `contact_panel` — location, hours, map, form
- `gallery_grid` — image grid
- `logo_strip` — accreditation / partner logos
- `why_us` — 3-4 icon-led benefits

### Section layout decisions

For each section, record:

```json
{
  "id": "services_1",
  "type": "services",
  "archetype": "service_cards_image",
  "layout": "three-column grid with image tops",
  "theme": "light",
  "background": "#FFFFFF",
  "notes": "Use real service photos, not icons. Card CTAs link to phone."
}
```

---

## Step 4 — Define conversion devices

### CTA hierarchy

Define the primary, secondary, and tertiary actions:

```json
{
  "cta_hierarchy": {
    "primary": {
      "action": "call_now",
      "label": "Call 07379 176466",
      "href": "tel:+447379176466",
      "placement": ["nav", "hero", "services", "final_cta"]
    },
    "secondary": {
      "action": "whatsapp",
      "label": "WhatsApp us",
      "href": "https://wa.me/447379176466",
      "placement": ["hero", "final_cta"]
    },
    "tertiary": {
      "action": "scroll_to_services",
      "label": "View services",
      "placement": ["hero"]
    }
  }
}
```

### Trust signals

Choose the trust signals that match the business class:

| Signal | Best for | Implementation |
|---|---|---|
| Years of experience | All local businesses | Stat bar |
| 24/7 availability | Emergency trades | Hero badge, trust bar |
| Local coverage | Trades, services | Trust bar, about section |
| Customer reviews | All | Testimonials, star ratings |
| Certifications / accreditations | Trades, professional services | Logo strip, badges |
| Fair pricing / no hidden costs | Trades | Trust bar, CTA reassurance |
| Real work photos | Trades, beauty, food | Gallery, about, service cards |
| Team / founder photo | Services, professional | Hero, about |

If accreditations are known (e.g. Gas Safe, Water Safe, City & Guilds), list them explicitly. If unknown, do not invent them.

### Objection reduction

For each section, identify what anxiety it reduces:

- Hero: "Will they answer?" → 24/7, phone visible
- Trust bar: "Are they real?" → local, stats, coverage
- Services: "Can they fix my problem?" → specific service descriptions
- Process: "What happens if I call?" → clear steps
- About: "Are they qualified?" → credentials, experience
- Testimonials: "Will they do a good job?" → reviews with outcomes
- Final CTA: "Is it safe to call?" → no pressure, 24/7

---

## Step 5 — Define imagery direction

### Photography style

The imagery direction must be specific enough to generate or source consistent assets.

```json
{
  "visual_tokens": {
    "photography": {
      "style": "realistic documentary",
      "mood": "capable, calm, local",
      "lighting": "natural daylight, soft shadows",
      "colour_treatment": "true-to-life, slightly warm",
      "subjects": "plumber at work, under-sink repair, van, tools",
      "avoid": "stock bathroom interiors, posed models, corporate office settings"
    }
  }
}
```

### Asset list

For each section, decide what assets it needs:

| Section | Typical assets |
|---|---|
| Nav | Logo |
| Hero | Hero portrait or work image |
| Trust bar | Icons only |
| Services | Icon-led, or image-led cards |
| Process | Icons only |
| About | Founder photo or work photo |
| Testimonials | 3 customer avatars |
| CTA | None, or background texture |
| Footer | None |

### Asset generation rules

- Generate images that look like real photos, not illustrations.
- Describe the scene, lighting, and subject precisely.
- Include business-specific details where possible (workwear colour, vehicle type, location type).
- Avoid generating logos as complex graphics. Use wordmarks or simple marks.
- For logos, prefer text-based wordmarks over abstract symbols unless the business has a clear symbol.

---

## Step 6 — Produce the design doctrine

The final output is a structured design doctrine that the Site Composer embeds in `composition.json`.

```json
{
  "design_doctrine": {
    "archetype": "clean_local",
    "emotional_positioning": "Reliable, local, and ready — a plumber who answers the phone when it matters.",
    "trust_strategy": "Lead with 24/7 availability, local area coverage, and real work imagery.",
    "hero_strategy": "Promise fast local plumbing help. Phone number is the primary action. WhatsApp is secondary.",
    "conversion_strategy": "Move the visitor from 'I have a plumbing problem' to 'I will call LRT now'.",
    "objection_reduction_strategy": "Free intro removes cost risk. Process section explains what happens. Testimonials prove results.",
    "local_credibility_strategy": "Show Warwickshire, Coventry, Rugby, Leamington Spa coverage. Real work photos.",
    "proof_and_reassurance_strategy": "24/7 availability, local coverage, fast response, testimonials, fair pricing."
  }
}
```

---

## Step 7 — Validate the design

Before the design doctrine is written, check:

- [ ] The archetype matches the business class
- [ ] The colour language matches the brand personality and visual language
- [ ] The typography language matches the reading behaviour required
- [ ] The material language gives the page physical presence without competing with content
- [ ] The palette has no more than 1 accent colour
- [ ] The page pattern matches the business class
- [ ] The primary CTA is obvious in the hero
- [ ] Every section has a clear trust or conversion purpose
- [ ] The imagery direction is specific enough to generate assets
- [ ] The section order follows the storytelling rhythm arc
- [ ] Spacing values match the design system (no invented padding/margins)
- [ ] Title alignment is consistent across all sections
- [ ] Heading sizes match the hierarchy table
- [ ] No startup or AI design language
- [ ] No generic three-card rows unless the section genuinely needs them
- [ ] Mobile collapse is considered for every section

---

## Output summary

Report the design decisions as:

```
Design Composer complete
  Archetype: <archetype>
  Palette: <accent> on <background>
  Typography: <font stack>
  Sections: <n> using <archetypes>
  Primary CTA: <label>
  Assets required: <n> images
  Key trust signals: <list>
```

---

## Doctrine references

- `operators/skills/art-director.md` — upstream creative direction
- `sorted-skills/00-foundations/` — Sorted Design Language foundations
- `sorted-skills/01-brand/` — brand personality and tone
- `sorted-skills/02-visual-language/` — visual language selection
- `sorted-skills/03-photography/` — photography doctrine
- `sorted-skills/04-composition/` — composition rules
- `sorted-skills/05-motion/` — motion doctrine
- `sorted-skills/06-components/` — component specifications
- `design-taste-frontend` — frontend implementation discipline
