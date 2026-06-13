# Asset Generator

**Sorted Manufacturing Line — Operator v0.1.0**

Takes a website mockup image and its Mockup Deconstructor JSON, then produces a complete folder of production-ready image assets with a deterministic manifest. Eliminates the manual "what images do I need and how do I get them?" step.

---

## Where this fits

```
Mockup Deconstructor
↓
mockup.json  (asset manifest)
↓
Asset Generator  ← you are here
↓
output/assets/   (production-ready files)
output/manifest.json
↓
Website Build
```

---

## What it produces

```
output/
  assets/
    hero_founder_image/
      original.webp
      lg.webp          (1920px wide)
      md.webp          (1024px wide)
      sm.webp          (640px wide)
      xs.webp          (320px wide)
    testimonial_avatar_1/
      original.webp
      md.webp
      sm.webp
      xs.webp
    ...
  manifest.json        ← asset ID → file paths + metadata
  generation-log.json  ← timing, models, prompts used
```

---

## Setup

```bash
cd operators/asset-generator/implementation
npm install
cp .env.example .env
# Add OPENAI_API_KEY
```

---

## Usage

```bash
# Basic
npm run assets -- mockup.jpg output/mockup.json

# Verbose progress output
npm run assets -- mockup.jpg output/mockup.json --verbose

# Dry run — see what would happen without spending API credits
npm run assets -- mockup.jpg output/mockup.json --dry-run --verbose

# Only process critical + high priority assets first
npm run assets -- mockup.jpg output/mockup.json --priority critical,high

# Use DALL-E 3 instead of gpt-image-1
npm run assets -- mockup.jpg output/mockup.json --model dall-e-3

# Output JPG instead of WebP
npm run assets -- mockup.jpg output/mockup.json --format jpg

# Custom output directory
npm run assets -- mockup.jpg output/mockup.json --output /path/to/client/public/images/

# Skip assets whose output folder already exists (resume interrupted run)
npm run assets -- mockup.jpg output/mockup.json --skip-existing
```

---

## Execution modes

Each asset is automatically assigned an execution mode:

| Mode | When | What happens |
|------|------|------|
| `recreate` | `source: generate` | AI generates a new image from the description |
| `extract` | `mode_hint: extract` + `bbox` passes quality gates | Crops directly from the mockup |
| `source` | `source: stock` | Flagged for manual stock sourcing — skipped in this run |
| `reuse` | `source: reuse` | Flagged for brand asset supply — skipped in this run |

**Quality gates for extract mode:**
- Crop dimensions must meet minimum per asset type (e.g. persons: 400×400px, logos: 200×80px)
- If gates fail → automatically falls back to `recreate`

---

## Generation models

| Flag | Model | Notes |
|------|-------|-------|
| `--model gpt-image-1` | OpenAI gpt-image-1 | Default — high quality, returns base64 |
| `--model dall-e-3` | OpenAI DALL-E 3 | Slightly different style, returns URL |

---

## Output sizes

All generated/extracted assets are resized to these variants (only if original is large enough — no upscaling):

| Variant | Width |
|---------|-------|
| `original` | Full resolution |
| `lg` | 1920px |
| `md` | 1024px |
| `sm` | 640px |
| `xs` | 320px |

---

## manifest.json schema

```json
{
  "mockup": "mockup.jpg",
  "deconstruction": "mockup.json",
  "generated_at": "2026-06-12T10:30:00.000Z",
  "operator_version": "0.1.0",
  "assets": [
    {
      "id": "hero_founder_image",
      "mode": "recreate",
      "status": "ok",
      "files": {
        "original": "assets/hero_founder_image/original.webp",
        "lg": "assets/hero_founder_image/lg.webp",
        "md": "assets/hero_founder_image/md.webp",
        "sm": "assets/hero_founder_image/sm.webp",
        "xs": "assets/hero_founder_image/xs.webp"
      },
      "meta": {
        "format": "webp",
        "width": 1024,
        "height": 1280,
        "source_model": "gpt-image-1",
        "prompt_used": "...",
        "aspect_ratio": "4:5"
      }
    }
  ]
}
```

---

## File structure

```
implementation/
  src/
    cli.ts            ← CLI entry point
    orchestrator.ts   ← Core pipeline orchestrator
    extract.ts        ← Bbox crop from mockup (sharp)
    generate.ts       ← AI image generation (OpenAI)
    quality.ts        ← Mode resolver + quality gates
    resize.ts         ← Size variant producer (sharp)
    manifest.ts       ← manifest.json + generation-log writer
    schema.ts         ← Zod validation
    types.ts          ← TypeScript type definitions
    index.ts          ← Public API exports
  examples/
    fitness-studio-manifest.json
    fitness-studio-generation-log.json
  output/             ← Generated assets (gitignored)
  package.json
  tsconfig.json
  README.md
```

---

## Development

```bash
npm run lint    # type check only
npm run build   # compile to dist/
```

---

## Pipeline integration

Run both operators in sequence to go from mockup image to production assets:

```bash
# Step 1 — Deconstruct the mockup
cd operators/mockup-deconstructor/implementation
npm run deconstruct -- mockup.jpg --verbose

# Step 2 — Generate the assets
cd ../../asset-generator/implementation
npm run assets -- ../../mockup-deconstructor/implementation/mockup.jpg \
  ../../mockup-deconstructor/implementation/output/mockup.json \
  --verbose
```
