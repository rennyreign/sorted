# Skill: site-build

**Type:** Orchestration skill  
**Trigger:** User provides a mockup image and asks to build a client site  
**Chain:** Runs all three sub-skills in sequence: mockup-deconstructor → asset-generator → frontend-builder  
**Output:** Ready-to-review Next.js site repo, `npm run build` passing clean

---

## When to load this skill

Load when the user says any of:
- "Build the site from this mockup"
- "Run the full build for [client]"
- "Take this to a site"
- "Go from mockup to build"

This skill orchestrates the full manufacturing chain. Load the individual sub-skills only if running a single step in isolation.

---

## Before starting

Confirm you have:
- [ ] Mockup image (`.jpg`, `.png`, or `.webp`)
- [ ] Client slug (short name, lowercase, hyphenated — e.g. `raffles`, `bodysharp`)
- [ ] Output directory or confirm default (`operators/frontend-builder/implementation/output/<slug>-site/`)

If the client already has a deconstruction JSON or asset manifest from a prior run, confirm whether to reuse them or regenerate.

---

## Execution sequence

### Step 1 — Deconstruct the mockup

Load skill: `operators/skills/mockup-deconstructor.md`

- Input: mockup image file
- Output: `deconstruction.json` written to `operators/mockup-deconstructor/implementation/output/<slug>.json`
- Confirm the JSON is valid before proceeding — check `sections`, `assets`, and `copy` arrays are populated

### Step 2 — Generate assets

Load skill: `operators/skills/asset-generator.md`

- Input: mockup image + `deconstruction.json`
- Output: `assets/` folder + `manifest.json` written to `operators/asset-generator/implementation/output/<slug>/`
- Confirm manifest lists at least the critical-priority assets before proceeding

### Step 3 — Build the frontend

Load skill: `operators/skills/frontend-builder.md`

- Input: `deconstruction.json` + `manifest.json` + `assets/`
- Output: complete Next.js site repo at the output directory
- Confirm `npm run build` passes with zero errors before handing off

---

## State checkpoints

At each step, the output artifact is written to disk. If a step fails:

1. Diagnose against the artifact schema in `doctrine/operator-chain.md`
2. Fix the specific failure — do not re-run the entire chain from scratch
3. Resume from the failed step

The artifacts are the source of truth. The chain is resumable at any checkpoint.

---

## Quality gate before handoff

Run through these before calling the build complete:

- [ ] `npm run build` passes clean — zero TypeScript errors, zero CSS errors
- [ ] Hero section matches the mockup — full-bleed image, headline, primary CTA visible
- [ ] All sections present in the correct order (see `sorted-local-site-refresh` page pattern)
- [ ] All assets resolved — no broken image paths in the generated components
- [ ] Copy is real — no lorem ipsum, no placeholder text
- [ ] Phone / email / address placed correctly in the contact section and footer
- [ ] Mobile-safe — no horizontal scroll at 375px viewport
- [ ] Primary CTA is obvious within 5 seconds

---

## Output summary to report back

When complete, report:

```
Build complete — <client-slug>
  Tier: Standard | Premium
  Sections: <n> sections generated
  Assets: <n>/<total> resolved
  Build: PASSED
  Output: <path>
  Est. API cost: ~$<n>

Notable decisions:
  - <any design or copy decision made>

Premium upgrade opportunities:
  - <any sections that would benefit from premium treatment>
```

---

## Doctrine references

- `doctrine/sorted-operating-model.md` — Four Nods, the manufacturing model
- `doctrine/operator-chain.md` — state contract, artifact schemas, chain map
- `operators/skills/mockup-deconstructor.md` — Step 1 execution detail
- `operators/skills/asset-generator.md` — Step 2 execution detail
- `operators/skills/frontend-builder.md` — Step 3 execution detail
