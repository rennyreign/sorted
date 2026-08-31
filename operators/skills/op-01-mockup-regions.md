# Skill: op-01-mockup-regions

**Operator:** 1 — Mockup Region Decomposition
**Execution:** harness
**Trigger:** `mockup-regions` is the next pending operator
**Input:** `input/approved-mockup.png` + `input/image-manifest.json`
**Output:** `artifacts/regions.json` + `artifacts/regions/` (crops) + `artifacts/deconstruction.json`

---

## What you do

You have vision. Use it to read the mockup image and decompose it.

### Step 1: Read the mockup

Open and visually inspect the mockup image. Identify every logical page region in top-to-bottom order:

- header / nav
- hero
- hero_image (if the hero contains a distinct image)
- trust_strip / trust_bar
- services / features
- service_image_01, service_image_02, etc.
- story / about
- story_image
- testimonials
- gallery
- cta
- footer

### Step 2: Record regions

For each region, record:
- `id` — deterministic slug (e.g. `hero`, `hero_image`, `services`, `service_image_01`)
- `type` — `section` | `image` | `asset`
- `section` — parent section (for image/asset regions)
- `label` — human-readable label
- `bbox` — bounding box `{ x, y, w, h }` in mockup pixel coordinates
- `asset_id` — link to the corresponding image-manifest entry (for image regions)
- `crop_path` — relative path to cropped image (for image regions)

### Step 3: Crop image regions

For each image/asset region, crop the mockup to that region's bbox and save to `artifacts/regions/<region_id>.png`. Use sharp or ImageMagick.

### Step 4: Produce deconstruction.json

Also produce a richer deconstruction of the mockup for downstream operators:

- `page_type` — homepage, service_page, landing_page, etc.
- `sections[]` — id, type, position, label, layout, theme, background
- `assets[]` — id, type, description, priority, source, section, slot, aspect_ratio, bbox, mode_hint
- `copy[]` — section, type (headline/subheadline/body/cta/label/etc.), text
- `components[]` — inferred component names (e.g. `hero_v3`, `testimonial_cards_v2`)
- `build_notes` — layout, style, theme, accent_color, primary_font, secondary_font, animation, grid, notes

This is the same schema as the existing `mockup-deconstructor` output. You are replacing that operator by doing its work in-session.

### Step 5: Write artifacts

Write `artifacts/regions.json` (regions + deconstruction combined — see contract in `operators/factory-orchestrator/src/contracts.ts`).
Write `artifacts/deconstruction.json` (the richer deconstruction, for easy downstream access).

### Step 6: Mark passed

Mark `mockup-regions` as passed in build state.

## Validation

- `regions.json` exists and is valid JSON
- At least 3 regions identified
- All image regions have bbox and crop_path
- All crop files exist on disk
- `deconstruction.json` has sections, assets, copy arrays

## Failure states

- Mockup is blank or corrupt → escalate
- Vision analysis returns unusable data → retry once, then escalate
- Crop files fail to write → check disk space, retry

## Notes

- The existing `mockup-deconstructor` operator used external vision models (GPT-4.1, Claude, Gemini). You are replacing that with your own vision capability. No external API call needed.
- The image manifest provides the asset specifications. Your job is to associate mockup regions with those manifest entries and produce the richer deconstruction.
- Do not regenerate anything. This operator performs decomposition only.
