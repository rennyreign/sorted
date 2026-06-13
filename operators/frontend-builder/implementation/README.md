# Frontend Builder Operator

**Position in chain:** Operator 3 of 3

```
Mockup → [Deconstructor] → raffles.json
                        → [Asset Generator] → manifest.json + assets/
                                           → [Frontend Builder] → ready-to-deploy Next.js repo
```

Takes the structured JSON from the Mockup Deconstructor and the asset manifest from the Asset Generator. Produces a complete, ready-to-deploy Next.js client site scaffolded from the Sorted client-site template.

---

## What it produces

```
output/raffles-site/
  app/
    layout.tsx           ← client metadata (title, description, OG)
    globals.css          ← brand accent colour injected into @theme
    page.tsx             ← homepage assembler
  components/
    Nav.tsx              ← client nav: logo, links, phone, CTA
    Footer.tsx           ← client footer: nav, contact, social, legal
    sections/
      Hero1.tsx
      AboutIntro.tsx
      EventsHighlight.tsx
      MenuHighlights.tsx
      Testimonials1.tsx
      CtaVisitUs.tsx
  public/
    assets/              ← all generated assets copied in (webp variants)
  client/
    brief.md             ← auto-populated from deconstruction data
    assets/              ← place original brand files here
  build-log.json         ← per-file generation log
  package.json
  next.config.mjs
  tsconfig.json
  ...
```

---

## Requirements

- Node.js 20+
- `ANTHROPIC_API_KEY` in `.env`
- Completed deconstruction JSON (from Mockup Deconstructor)
- Completed manifest JSON + assets dir (from Asset Generator)
- Access to `sorted/templates/client-site/` (auto-detected)

---

## Usage

```bash
cd operators/frontend-builder/implementation
npm install
cp .env.example .env  # add your ANTHROPIC_API_KEY

# Full run
node dist/cli.js \
  ../../mockup-deconstructor/implementation/output/raffles.json \
  ../../asset-generator/implementation/output/raffles/manifest.json \
  ../../asset-generator/implementation/output/raffles/assets \
  --slug raffles \
  --output ./output/raffles-site

# Dry run — preview plan without generating anything
node dist/cli.js raffles.json manifest.json assets/ --dry-run --verbose

# Premium tier
node dist/cli.js raffles.json manifest.json assets/ --tier premium --slug raffles

# Skip the final build verification (faster iteration)
node dist/cli.js raffles.json manifest.json assets/ --no-build --slug raffles
```

---

## How it works

### Generation strategy

Each file is generated as a separate Claude call. This avoids token limits, gives each file the full context budget it needs, and means a failed section doesn't block others.

**Generation order:**
1. `globals.css` — injects brand accent colour into `@theme`
2. `app/layout.tsx` — client metadata
3. `components/Nav.tsx` — client nav
4. `components/sections/*.tsx` — one file per content section, in page order
5. `components/Footer.tsx` — client footer
6. `app/page.tsx` — assembles all sections

### Skills embedded in every prompt

The system prompt carries the full `sorted-local-site-refresh` + `design-taste-frontend` rule sets directly — no URL references. Every Claude call operates under:

- Sorted design standards (obvious, useful, trustworthy, local)
- Anti-slop rules (no startup language, no AI gradients, no generic cards)
- Stack constraints (TailwindCSS v4, lucide-react only, plain `<img>` tags, no new packages)
- Motion rules (standard tier CSS-only by default)
- Copy rules (plain English, no lorem ipsum)

### Tiers

- **Standard** (default): faithful to mockup, clean hover states, simple CSS transitions, quick build
- **Premium**: richer hero, staggered scroll reveals, refined typography — specify with `--tier premium`

### After generation

The operator runs `npm install` + `npm run build` inside the output repo automatically. If the build fails, it prints the first 40 lines of output for diagnosis.

---

## Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `deconstruction.json` | Mockup Deconstructor | Sections, copy, assets, build notes |
| `manifest.json` | Asset Generator | Asset IDs → file paths + status |
| `assets/` | Asset Generator | Generated WebP asset files |

---

## CLI flags

| Flag | Default | Description |
|------|---------|-------------|
| `--output <dir>` | `./output/<slug>` | Output repo directory |
| `--template <dir>` | auto-detected | Path to `sorted/templates/client-site/` |
| `--slug <name>` | from JSON filename | Client identifier |
| `--tier standard\|premium` | `standard` | Build quality tier |
| `--dry-run` | off | Preview plan without writing files |
| `--no-build` | off | Skip npm install + next build |
| `--verbose` | off | Detailed progress output |

---

## On the skills question

The skills embedded in this operator (`sorted-local-site-refresh`, `design-taste-frontend`, `full-output-enforcement`) currently live at `github.com/rennyreign/taste-skill`. As the pipeline matures, these should be consolidated under `sorted/operators/skills/` as a self-contained library — so the chain is fully portable and doesn't depend on an external repo at runtime.
