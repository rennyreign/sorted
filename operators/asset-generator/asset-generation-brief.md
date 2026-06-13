# Asset Generation Operator

## Context

We are building an AI-native website modernization factory (Sorted).

The current workflow is:

```
Business Website
↓
Screenshot Capture
↓
GPT-Image Mockup Operator
↓
Beautiful Modernized Website Mockup
↓
(Mockup Deconstruction Operator)
↓
(Asset Generation Operator)
↓
Website Build
```

The bottleneck we are removing is the manual asset work:

- identifying what images are needed
- extracting / regenerating / sourcing them
- packaging them into a production-ready folder + manifest

The input mockup is a GPT-image generated redesign. It acts as the *art direction reference* (composition, style, subject matter).

---

## Objective

Given:

- a completed website mockup image (or)
- a deconstruction JSON that includes an asset manifest

Produce:

- production-ready image files (correct formats, sizes, naming)
- a deterministic manifest mapping asset IDs → output files
- metadata required for reproducibility (model, prompts, seeds where available)

---

## Inputs

### Required

1) `mockup.jpg` (the mockup image)

2) `mockup.json` (output of Mockup Deconstruction Operator)

### `mockup.json` minimum required fields

The Asset Generation Operator assumes `mockup.json` includes:

- `assets[]` with `id`, `type`, `description`, `priority`, `source`

Recommended additions (if available):

- `section` and/or component slot
- `bbox` (bounding box in mockup coordinates)
- `aspect_ratio` and `variants`

---

## Outputs

Folder structure:

```
/output/
	assets/
		<asset_id>/
			original.(png|jpg|webp|svg)
			xs.(...)
			sm.(...)
			md.(...)
			lg.(...)
		manifest.json
		generation-log.json
```

`manifest.json` example:

```json
{
  "mockup": "mockup.jpg",
  "assets": [
    {
      "id": "hero_founder",
      "mode": "extract",
      "files": {
        "original": "assets/hero_founder/original.webp",
        "lg": "assets/hero_founder/lg.webp",
        "sm": "assets/hero_founder/sm.webp"
      },
      "meta": {
        "format": "webp",
        "aspect_ratio": "16:9"
      }
    }
  ]
}
```

---

## Asset Production Modes

Each asset should specify an execution mode (derived from `source` + quality checks):

1) **extract**

- Crop/segment directly from the mockup image using `bbox`.
- Use when the mockup already contains the correct photo/graphic and quality is sufficient.

2) **recreate**

- Generate a new image to match the mockup’s style/composition.
- Use when extraction quality is insufficient (compression, artifacts, low resolution) or when multiple variants are needed.

3) **source**

- Find a stock equivalent that matches the mockup.
- Use when licensing clarity is required and a close match is acceptable.

4) **reuse**

- Pull from existing brand assets (logos, icons, existing photography).

---

## Quality Gates (Deterministic)

For each asset, decide extract vs recreate based on measurable checks:

- minimum pixel dimensions for the needed output sizes
- face/text legibility (if applicable)
- compression artifacts / blurring thresholds
- background cutout quality (if required)

If quality gates fail → fall back to `recreate` or `source`.

---

## Models (Configurable)

This operator may use vision and/or image-generation models depending on the mode.

Preferred (configurable):

- GPT-4.1 Vision
- GPT-5 Vision
- Flux
- Gemini Vision
- Claude Vision

Implementation note:

- Vision models are used for: bbox refinement, style matching guidance, and validation.
- Image-generation models are used for: `recreate` mode.

---

## CLI

Example:

```bash
npm run assets mockup.jpg output/mockup.json
```

Outputs:

```
/output/assets/
/output/manifest.json
```

---

## Success Criteria

Given a GPT-generated redesign mockup and its deconstruction JSON, the operator should:

- produce a complete folder of required visual assets
- choose the correct mode (extract/recreate/source/reuse) per asset
- output a deterministic manifest mapping IDs to files
- require no manual “what images do I need next?” effort