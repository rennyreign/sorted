# Skill: site-composer

**Type:** Orchestration skill — analysis-driven site composition
**Trigger:** User provides a prospect website analysis and asks to generate a production-ready website preview without a manual mockup
**Chain position:** Replaces the mockup input to the existing build chain
**Upstream:** `operators/skills/website-analyser.md`
**Sub-skills:**
- `operators/skills/art-director.md` — makes creative direction decisions from analysis
- `operators/skills/design-composer.md` — translates creative direction into visual tokens and composition
**Downstream:** `operators/skills/asset-generator.md` → `operators/skills/frontend-builder.md`

---

## What this skill does

The Site Composer turns a structured website analysis into a complete design doctrine that downstream operators can render. It is the Creative Director layer of the Sorted build chain.

Instead of a human producing a mockup image first, the Site Composer reasons about the business, decides what the site should communicate, and emits a `composition.json` that the existing Asset Generator and Frontend Builder consume directly.

The result is a screenshot of a complete rendered site, generated from analysis, suitable for the Sorted review page and outreach flow.

---

## When to load this skill

Load when the user says any of:

- "Build a site from analysis"
- "Generate a preview for this prospect"
- "Run the Site Composer on [prospect]"
- "Turn this website analysis into a mockup"
- "Produce a screenshot-ready site without a manual mockup"

Do not use this skill when a manual mockup already exists. In that case, load `operators/skills/site-build.md` instead.

---

## Inputs required

- **Prospect analysis JSON** — output from `website-analyser`
- **Existing website URL or screenshot** — for reference and asset extraction
- **Client slug** — e.g. `fitness-studio`, `plumber-birmingham`
- **Business context** — category, primary conversion action, any known contact details

If the analysis is missing any of these fields, infer them from the website or ask the operator before proceeding.

---

## Output

A single file:

```
operators/site-composer-operator/output/<slug>/composition.json
```

`composition.json` is structurally backward-compatible with the existing `deconstruction.json` produced by `mockup-deconstructor`. The Frontend Builder can consume it with no changes.

It also contains extra design-doctrine fields that capture the reasoning behind the decisions, so the process is inspectable and improvable over time.

---

## Execution sequence (MVP)

### Step 0 — Produce creative direction (load art-director)

Before any design decisions are made, invoke `operators/skills/art-director.md`.

The Art Director reads the website analysis and the Sorted Design Language skills, then produces `creative_direction.json`. This is the single source of truth for all subsequent design decisions.

`creative_direction.json` must contain:

- `business` — classification, location, primary conversion, trust gap
- `brand` — personality, emotional positioning, tone, differentiator, value proposition
- `visual_language` — selected visual language and reason
- `photography` — primary and secondary photography doctrine
- `composition` — hero type, photography weight, reading rhythm, section density, dominant impression
- `trust` — ranked trust signals and where they appear
- `cta` — primary, secondary, tertiary actions
- `anti_patterns` — specific things this site must not do

All later steps must inherit from `creative_direction.json`. If a later decision contradicts it, the Art Director's decision wins.

### Step 1 — Classify the business

Read the website analysis and assign a Sorted business classification.

Use the classification from `creative_direction.json` if the Art Director produced one. Otherwise, assign from the supported classes:

Supported classes for the MVP:

| Class | Primary conversion | Typical sections |
|---|---|---|
| local service | request quote / call now | hero, services, trust bar, about, testimonials, contact, footer |
| trade | call now / WhatsApp | hero, services, locations, trust bar, about, contact, footer |
| fitness | book intro | hero, services, process, trust bar, testimonials, contact, footer |
| beauty | book appointment | hero, services, gallery, testimonials, about, contact, footer |
| food | book table / visit shop / order | hero, menu/services, about, gallery, testimonials, contact, footer |
| professional service | book intro / request quote | hero, services, credentials, testimonials, contact, footer |
| booking-led | book now | hero, how it works, availability, trust, FAQ, contact, footer |
| trust-led | call now / request quote | hero, reviews, credentials, process, about, contact, footer |

### Step 2 — Choose the primary conversion action

Based on the business class and the analysis weaknesses, pick the single action the site must make obvious.

Options:

- call now
- book intro
- request quote
- visit shop
- join class
- WhatsApp
- order online

This decision drives every CTA label, nav button, and final-CTA section.

### Step 3 — Decide the emotional positioning

Write one sentence that captures how the site should feel to a first-time visitor. This is not copy. It is the tone directive.

Examples:

- "Confident, calm, and local — a tradesperson you can rely on."
- "Premium but approachable — a fitness coach who gets results without the noise."
- "Warm and established — a restaurant that feels like it has been here forever."

### Step 4 — Build the design doctrine (load design-composer)

The visual and structural design reasoning is handled by `operators/skills/design-composer.md`. Load it before making any design decisions.

The Design Composer produces:

1. `design_doctrine` — the strategic reasoning
2. `visual_tokens` — colours, typography, spacing, photography direction
3. `section_archetypes` — the layout archetype for each section
4. `cta_hierarchy` — primary, secondary, and tertiary actions

The Site Composer then embeds these into `composition.json`.

```json
{
  "design_doctrine": {
    "archetype": "clean_local",
    "emotional_positioning": "how the site should feel",
    "trust_strategy": "how the site will make the business look credible",
    "hero_strategy": "what the hero will promise",
    "conversion_strategy": "how the page moves a visitor toward the primary action",
    "objection_reduction_strategy": "what objections the copy and proof will answer",
    "local_credibility_strategy": "how location and team proof will appear",
    "proof_and_reassurance_strategy": "testimonials, stats, guarantees, accreditations"
  },
  "visual_tokens": {
    "archetype": "clean_local",
    "palette": {
      "background": "#FFFFFF",
      "background_alt": "#F8FAFC",
      "background_dark": "#0F172A",
      "text": "#0F172A",
      "text_secondary": "#475569",
      "text_inverse": "#FFFFFF",
      "accent": "#2563EB",
      "accent_hover": "#1D4ED8",
      "border": "#E2E8F0"
    },
    "typography": {
      "display": "Plus Jakarta Sans",
      "body": "Plus Jakarta Sans",
      "mono": "DM Mono"
    },
    "spacing": {
      "section_padding": "py-16 md:py-24",
      "content_max_width": "max-w-[1400px]",
      "grid_gap": "gap-6 lg:gap-8"
    },
    "photography": {
      "style": "realistic documentary",
      "mood": "capable, calm, local",
      "lighting": "natural daylight",
      "avoid": "stock interiors, posed models"
    }
  },
  "section_archetypes": {
    "hero_1": "hero_split",
    "trust_bar_1": "trust_bar",
    "services_1": "service_cards_image",
    "process_1": "process_steps",
    "about_1": "about_split",
    "testimonials_1": "testimonial_cards",
    "cta_1": "cta_band"
  },
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
    }
  }
}
```

### Include explicit contact details

The composition must include a `contact` object at the root level so the renderer never has to guess phone numbers, emails, or locations.

```json
{
  "contact": {
    "phone": "+447379176466",
    "phone_display": "07379 176466",
    "email": "lrtplumbingservices@gmail.com",
    "whatsapp": "+447379176466",
    "location": "Warwickshire, Coventry, Rugby and Leamington Spa",
    "hours": "24/7",
    "address": "if available"
  }
}
```

### Include explicit page metadata

The composition must include a `metadata` object so the renderer does not hallucinate titles or descriptions.

```json
{
  "metadata": {
    "title": "LRT Plumbing Services | Local Plumber in Warwickshire & Coventry",
    "description": "Local plumbing services for Warwickshire, Coventry, Rugby and Leamington Spa. Emergency repairs, leaks, boilers and bathrooms. Call 07379 176466."
  }
}
```

### Step 5 — Generate the section list

Using the Sorted page pattern, emit a `sections` array. Each section must have:

```json
{
  "id": "hero_1",
  "type": "hero",
  "position": 1,
  "label": "Hero",
  "archetype": "hero_split",
  "layout": "two-column split — text left, image right",
  "theme": "dark",
  "background": "#0a0a0a",
  "notes": "Full viewport height; primary CTA + phone; founder image right"
}
```

The `archetype` must match the entry in `visual_tokens.section_archetypes`.

Default section order for local service businesses:

1. nav
2. hero
3. trust_bar
4. services
5. process
6. about
7. testimonials
8. cta
9. footer

Adjust the order based on the business class, but keep the page pattern obvious: trust → services → why us → about → proof → contact.

### Step 6 — Generate the copy blocks

Produce all visible text in the same `copy` array format used by `deconstruction.json`. Attribute every block to a section and a type.

Rules:

- Plain English only. No startup language.
- Every CTA must be an action the visitor can take now.
- Headlines should name the outcome, not the category.
- Trust copy must be specific: real numbers, real locations, real outcomes.
- If business details are missing, infer the most believable local-business version and flag it in `build_notes`.

### Step 7 — Generate the asset list

List every image, icon, and background needed. Each asset must specify:

```json
{
  "id": "hero_founder_image",
  "type": "person",
  "description": "prompt for the image generator — precise enough to render without the mockup",
  "priority": "critical",
  "source": "generate",
  "section": "hero_1",
  "slot": "hero.primary_image",
  "aspect_ratio": "4:5",
  "mode_hint": "recreate"
}
```

For logos, use `source: generate` by default. The Design Composer should describe a clean wordmark based on the business name. A generated logo is safer than relying on the original, which is often low quality or missing.

### Step 8 — Choose the component family

Map each section `archetype` to a named component from the Sorted component library. The `archetype` is chosen by the Design Composer; the Site Composer selects the matching component implementation.

```json
{
  "component": "hero_split_v1",
  "section": "hero_1",
  "archetype": "hero_split",
  "description": "Two-column dark hero with editorial headline and dual CTAs",
  "variant": "dark-standard"
}
```

For the MVP, default to the standard component set. Premium variants are only used if the business class or brief clearly calls for a richer treatment.

### Step 9 — Emit build notes

The `build_notes` object must contain everything the Frontend Builder needs to reproduce the design faithfully. It should be derived from `visual_tokens`.

```json
{
  "layout": "full-bleed sections with max-width content",
  "style": "clean local trade — light sections with dark hero and final CTA",
  "theme": "mixed",
  "accent_color": "#2563EB",
  "primary_font": "Plus Jakarta Sans",
  "secondary_font": "DM Mono",
  "responsive_priority": true,
  "animation": "standard",
  "grid": "CSS Grid 12-column base",
  "notes": [
    "Use the palette from visual_tokens.palette",
    "Apply section archetypes from visual_tokens.section_archetypes",
    "Phone CTA is primary; WhatsApp is secondary"
  ]
}
```

### Step 10 — Validate before writing

Before writing `composition.json`, run these checks:

- [ ] `sections` has at least 5 sections
- [ ] `hero_1` section exists and has a headline and CTA
- [ ] `trust_bar_1` or equivalent proof section exists
- [ ] `services` or equivalent offer section exists
- [ ] `contact` or `cta` section exists
- [ ] Primary CTA is repeated in nav, hero, and final CTA section
- [ ] `assets` has at least one `critical` priority asset
- [ ] `assets` includes a logo or a text-logo fallback note
- [ ] `copy` has no lorem ipsum or placeholder text
- [ ] `design_doctrine` has a clear `trust_strategy` and `conversion_strategy`
- [ ] `visual_tokens` exists with `palette`, `typography`, `spacing`, and `photography`
- [ ] `section_archetypes` maps every section to a known archetype
- [ ] `cta_hierarchy` is explicit with labels, hrefs, and placements
- [ ] `build_notes.accent_color` is a valid hex colour
- [ ] `contact` object exists with `phone`, `phone_display`, `email`, and `location`
- [ ] `metadata` object exists with `title` and `description`
- [ ] Nav anchor targets (`#services`, `#about`, etc.) have matching section IDs

If validation fails, fix the specific issue. Do not proceed to downstream steps until validation passes.

---

## Output path convention

```
operators/site-composer-operator/output/<slug>/
  creative_direction.json   (produced by the Art Director)
  composition.json
  design-doctrine.md   (optional human-readable summary)
```

`creative_direction.json` is the creative brief. `composition.json` is the build specification. This keeps the Site Composer output separate from the mockup-deconstructor output while allowing downstream operators to treat `composition.json` exactly like `deconstruction.json`.

---

## Handoff to the existing build chain

Once `composition.json` is written, the Site Composer skill is complete. The next steps are handled by the existing build chain:

```
composition.json
  ↓
asset-generator  →  assets/ + manifest.json
  ↓
frontend-builder  →  <slug>-site/
  ↓
preview-generator  →  screenshot.png
```

Run the Frontend Builder with `composition.json` as the deconstruction argument. The renderer does not need to know that the source was analysis rather than a mockup.

---

## Prototype scope

For the first proof of concept, limit the scope to one real prospect and one business class. The goal is to prove that the analysis-to-screenshot loop works, not to handle every edge case.

Recommended first prototype:

- One local service or fitness business
- Standard tier design
- Single-page homepage
- Static site only — no CMS wiring
- Desktop screenshot as the deliverable

Do not attempt to build the full component library or the multi-provider asset pipeline in the first iteration. Prove the core loop first.

---

## Common failure modes

| Failure | Cause | Fix |
|---|---|---|
| Sections feel generic | Business class was not used to make decisions | Re-run classification and force class-specific section choices |
| Copy sounds like a SaaS landing page | Default tone not overridden | Set the emotional positioning explicitly and rewrite the hero |
| Missing trust signals | Analysis not mapped to proof sections | Add a trust_bar, testimonials, or credentials section |
| Hero image does not match business | Asset description too vague | Add business-specific details to the asset description |
| Frontend Builder renders poorly | `build_notes` missing layout guidance | Add specific layout and spacing notes |
| Generated screenshot is unpersuasive | Design doctrine disconnected from business | Review the `design_doctrine` against the actual business analysis |
| Renderer uses wrong phone / location / email | `contact` object missing or incomplete | Add explicit `contact` and `metadata` objects to the composition |
| Nav anchor links do nothing | Section IDs missing from generated components | Ensure section `id` values are surfaced in the composition and used by the renderer |

---

## Output summary to report

When complete, report:

```
Site Composer complete — <client-slug>
  Business class: <class>
  Primary CTA: <action>
  Sections: <n>
  Assets: <n> critical, <n> high, <n> medium
  Output: operators/site-composer-operator/output/<slug>/composition.json
  Next: asset-generator → frontend-builder → preview-generator

Design doctrine:
  - <one-line trust strategy>
  - <one-line conversion strategy>
  - <one-line local credibility strategy>
```

---

## Doctrine references

- `doctrine/sorted-operating-model.md` — Four Nods, Stage 1 build rules, no CMS before Nod 2
- `doctrine/operator-chain.md` — state contract, artifact schemas, chain map
- `operators/skills/website-analyser.md` — upstream analysis output
- `operators/skills/art-director.md` — creative direction from analysis
- `operators/skills/design-composer.md` — visual token and composition reasoning
- `operators/skills/asset-generator.md` — downstream asset generation
- `operators/skills/frontend-builder.md` — downstream rendering
- `operators/skills/site-build.md` — mockup-driven build chain for comparison
- `sorted-skills/` — the Sorted Design Language foundation, brand, visual language, photography, composition, motion and component doctrine files
