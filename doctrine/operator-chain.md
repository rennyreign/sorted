# Operator Chain — State Contract

**Status:** Active doctrine  
**Parent:** Sorted Operating Model  
**Purpose:** Define the state that flows between every step in the Sorted manufacturing chain, so the chain runs identically whether executed by an orchestration agent or by discrete stateless operators.

---

## The Two Execution Modes

The Sorted manufacturing chain has two runtime modes. The doctrine, state shape, and output quality are identical in both. Only the runtime differs.

### Mode 1 — Orchestration Agent (default)

An orchestration agent (Devin) runs the full chain in a single session. It loads the doctrine, executes each step using its native capabilities, and calls external APIs (vision models, image generation) only when a capability is needed that it does not hold natively.

```
Agent session
  ├── reads doctrine + skills
  ├── Step 1: calls vision API → writes deconstruction.json
  ├── Step 2: calls image gen API → writes assets/ + manifest.json
  ├── Step 3: writes TSX directly → runs next build
  └── hands off output repo
```

**When to use:** Any single-client build. Default mode. Fast, cheap, low coordination overhead.

### Mode 2 — Operator Pipeline (scale)

Each step runs as a discrete stateless process. Steps consume a defined input artifact and produce a defined output artifact. Steps can run in parallel when inputs are independent. The pipeline is orchestrated by a job queue, not an agent.

```
Job queue
  ├── dispatch: mockup.jpg → mockup-deconstructor → deconstruction.json
  ├── dispatch: deconstruction.json + mockup.jpg → asset-generator → manifest.json + assets/
  └── dispatch: deconstruction.json + manifest.json + assets/ → frontend-builder → site repo
```

**When to use:** Multiple concurrent builds. Automated pipelines. Runs without a human in the loop.

---

## The State Layer

State materialises as files on disk between steps. These are the canonical artifacts — the same in both execution modes.

### Artifact 1 — `deconstruction.json`
**Produced by:** Mockup Deconstructor  
**Consumed by:** Asset Generator, Frontend Builder

```
{
  page_type        string
  sections[]       id, type, layout, theme, copy_blocks[], asset_refs[]
  assets[]         id, description, source, mode_hint, bbox, aspect_ratio, priority
  components[]     inferred component names for the Sorted library
  copy[]           all visible text, attributed to section + typed
  build_notes      accent_color, font_stack, layout_system, animation_level, notes[]
  meta             mockup_file, model_used, generated_at, operator_version
}
```

Full TypeScript types: `operators/mockup-deconstructor/implementation/src/types.ts`  
Zod schema: `operators/mockup-deconstructor/implementation/src/schema.ts`

### Artifact 2 — `manifest.json` + `assets/`
**Produced by:** Asset Generator  
**Consumed by:** Frontend Builder

```
manifest.json
{
  mockup          source image path
  deconstruction  source JSON path
  generated_at    ISO timestamp
  assets[]
    id            matches deconstruction asset id
    mode          recreate | extract | source | reuse
    status        ok | skipped | failed
    files
      original    path to full-res WebP
      lg          1920px variant
      md          1024px variant
      sm          640px variant
      xs          320px variant
    meta          format, width, height, source_model, prompt_used
}

assets/
  <asset_id>/
    original.webp
    lg.webp
    md.webp
    sm.webp
    xs.webp
```

Full schema: `operators/asset-generator/implementation/src/types.ts`

### Artifact 3 — Client site repo
**Produced by:** Frontend Builder  
**Consumed by:** Human review, Netlify deploy

```
<slug>-site/
  app/
    globals.css      brand tokens in @theme
    layout.tsx       client metadata + viewport
    page.tsx         section assembler
  components/
    Nav.tsx
    Footer.tsx
    sections/
      <Section>.tsx  one file per content section
  public/
    assets/          all WebP variants copied in
  client/
    brief.md         auto-populated from deconstruction
  build-log.json     per-file generation log with token usage
  package.json
  next.config.mjs
  tsconfig.json
```

---

## Chain Map

```
mockup.jpg
    │
    ▼
┌─────────────────────────┐
│  MOCKUP DECONSTRUCTOR   │  Vision model (GPT-4.1 / Claude / Gemini)
│  skill: mockup-         │  Reads: mockup.jpg
│         deconstructor   │  Writes: deconstruction.json
└─────────────────────────┘
    │
    ▼
deconstruction.json
    │
    ├──────────────────────┐
    ▼                      ▼
┌──────────────────────┐   (passes through to step 3)
│  ASSET GENERATOR     │  Image gen model (gpt-image-1)
│  skill: asset-       │  Reads: mockup.jpg + deconstruction.json
│         generator    │  Writes: assets/ + manifest.json
└──────────────────────┘
    │
    ▼
manifest.json + assets/
    │
    ▼
┌─────────────────────────┐
│  FRONTEND BUILDER       │  Code gen model (claude-sonnet-4-5)
│  skill: frontend-       │  Reads: deconstruction.json + manifest.json + assets/
│         builder         │  Writes: complete Next.js site repo
└─────────────────────────┘
    │
    ▼
<slug>-site/  →  npm run build  →  Nod 2 review
```

---

## Execution Rules

### For the orchestration agent

1. Load `doctrine/operator-chain.md` at session start — know the state shape before touching anything
2. Run steps sequentially unless assets and deconstruction can be parallelised (they cannot — asset generator needs the deconstruction JSON)
3. Write each artifact to the canonical path before proceeding to the next step
4. If a step fails, diagnose against the artifact schema before retrying
5. Do not skip the build verification step — `npm run build` passing is the quality gate

### For the operator pipeline

1. Each operator reads its input artifact path from the job payload
2. Each operator writes its output artifact to the path specified in the job payload
3. Operators are stateless — they carry no memory between runs
4. Retries are safe — operators are idempotent given the same input
5. The job queue is responsible for sequencing — operators do not know about each other

---

## Skill vs Operator

| | Skill | Operator |
|---|---|---|
| **What it is** | Markdown doctrine loaded by the orchestration agent | Standalone Node.js / Python process |
| **Runtime** | Agent session | Job queue / CLI |
| **State** | Files on disk, read/written by the agent | Files on disk, read/written by the process |
| **When to use** | Single build, agent in the loop | Scale, automation, no agent |
| **Source of truth** | `operators/skills/<name>.md` | `operators/<name>/implementation/` |

Both execute the same doctrine. The skill is the fast path. The operator is the scale path.

---

## Adding a New Step

When adding a new step to the chain:

1. Define the input artifact shape — what does it consume, and from which upstream step?
2. Define the output artifact shape — what does it produce, and what shape?
3. Write the skill file first: `operators/skills/<name>.md`
4. The skill is the canonical specification. The operator implementation follows the skill, not the other way around.
5. Update this document with the new artifact and chain map entry.

---

## Current Chain Version

| Step | Skill | Operator | Status |
|---|---|---|---|
| Mockup Deconstructor | `operators/skills/mockup-deconstructor.md` | `operators/mockup-deconstructor/` | Active |
| Asset Generator | `operators/skills/asset-generator.md` | `operators/asset-generator/` | Active |
| Frontend Builder | `operators/skills/frontend-builder.md` | `operators/frontend-builder/` | Active |
| SortedUpdates CMS | `.devin/workflows/add-decap-cms.md` | `operators/sorted-updates/` | Active |
| Playwright Tests | — | — | Planned |
| Client Quote Page | — | — | Planned |
