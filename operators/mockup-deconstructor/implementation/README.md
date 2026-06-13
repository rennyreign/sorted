# Mockup Deconstructor

**Sorted Manufacturing Line — Operator v0.1.0**

Converts a website mockup image (produced by the GPT-image mockup operator) into a structured JSON handoff artifact. This artifact is the input to the Asset Generation Operator and the Website Build stage.

---

## Where this fits

```
GPT-Image Mockup Operator
↓
website-mockup.jpg
↓
Mockup Deconstructor  ← you are here
↓
mockup.json
↓
Asset Generation Operator
↓
Website Build
```

---

## What it produces

A single JSON file containing:

- **`page_type`** — homepage, service_page, landing_page, etc.
- **`sections`** — every section identified top-to-bottom with type, layout, theme
- **`assets`** — production-oriented manifest of every visual asset needed (with descriptions precise enough for the Asset Generator to produce them)
- **`components`** — inferred design-system component names for the Sorted component library
- **`copy`** — all visible text extracted verbatim, typed and attributed to sections
- **`build_notes`** — layout system, colour palette, typography, animation level, implementation notes

---

## Setup

```bash
cd operators/mockup-deconstructor/implementation
npm install
cp .env.example .env
# Edit .env and add your API key
```

**.env.example:**
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...
```

---

## Usage

```bash
# Basic — uses OpenAI GPT-4.1 by default
npm run deconstruct -- mockup.jpg

# With verbose output
npm run deconstruct -- mockup.jpg --verbose

# Specify provider
npm run deconstruct -- mockup.jpg --provider anthropic

# Specify provider + model
npm run deconstruct -- mockup.jpg --provider gemini --model gemini-2.5-pro

# Specify output path
npm run deconstruct -- mockup.jpg --output output/my-client.json
```

Output is written to `output/<imagename>.json` by default.

---

## Supported providers

| Flag | Provider | Default model |
|------|----------|---------------|
| `--provider openai` | OpenAI | `gpt-4.1` |
| `--provider anthropic` | Anthropic | `claude-opus-4-5` |
| `--provider gemini` | Google | `gemini-2.5-flash` |

---

## Output schema

See `examples/fitness-studio-mockup.json` for a full example output.

Full TypeScript types in `src/types.ts`. Zod schema in `src/schema.ts`.

### Top-level fields

```json
{
  "page_type": "homepage",
  "sections": [...],
  "assets": [...],
  "components": [...],
  "copy": [...],
  "build_notes": {...},
  "meta": {...}
}
```

### Asset `source` values

| Value | Meaning |
|-------|---------|
| `generate` | AI-generate a clean version based on the description |
| `stock` | Source from stock library (non-face images only) |
| `reuse` | Use existing brand asset (logos, etc.) |

### Asset `priority` values

| Value | Meaning |
|-------|---------|
| `critical` | Hero images, logos — blocks launch if missing |
| `high` | Key section images — required for quality |
| `medium` | Supporting imagery — needed but not launch-blocking |
| `low` | Decorative or supplementary |

---

## File structure

```
implementation/
  src/
    cli.ts          ← CLI entry point
    deconstruct.ts  ← Core orchestrator
    vision.ts       ← Vision model client (OpenAI / Anthropic / Gemini)
    prompt.ts       ← System and user prompts
    schema.ts       ← Zod validation schema
    types.ts        ← TypeScript type definitions
    index.ts        ← Public API exports
  examples/
    fitness-studio-mockup.json   ← Example output
  output/           ← Generated JSON files (gitignored)
  package.json
  tsconfig.json
  README.md
```

---

## Development

```bash
# Type check
npm run lint

# Build to dist/
npm run build
```

---

## Notes for downstream operators

The `assets` array is the primary input to the **Asset Generation Operator**. Each asset entry includes:

- A `description` precise enough to generate or source the asset without the original mockup
- A `source` hint (`generate` / `stock` / `reuse`)
- A `mode_hint` (`extract` vs `recreate`)
- An estimated `bbox` in mockup pixel coordinates for crop/extract workflows
- `aspect_ratio` for generation sizing

The `copy` array is the primary input to the **Website Build** stage — all text is attributed to sections and typed (headline, CTA, testimonial, etc.).

The `components` array seeds the **Sorted component library** — each entry names a reusable component pattern that can be catalogued and reused across client builds.
