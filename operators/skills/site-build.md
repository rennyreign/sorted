# Skill: site-build

## No hosting or deploys before client approval

Stage 1 sites stay local. Do not create a Netlify site, link a repo to Netlify, add deploy hooks, or push the client repo to any remote that auto-builds until the client has approved the design (Nod 2) and Renaldo explicitly asks for a deploy. Netlify builds consume credits on every push — an unapproved Stage 1 site has no reason to exist there. The client reviews the design through the Sorted workspace preview screenshot and, if needed, a locally served `out/` export.

## Stage 1 Internal-Page Links

Before building or resuming a pre-approval client site, read `operators/skills/stage-1-direction-confirmation.md` (from the Sorted repo root). Implement its shared direction-confirmation pages and consistent internal routes during Op 4, before Op 5/5b. This is an intentional review state, not a finished internal page or client approval.


**Type:** Orchestration skill  
**Trigger:** User provides a mockup image and asks to build a client site  
**Chain:** Supplied export pack -> validated intake -> asset registry -> frontend -> independent QA -> existing lifecycle  
**Output:** Ready-to-review Next.js site repo, `npm run build` passing clean

---

## When to load this skill

Load when the user says any of:
- "Build the site from this mockup"
- "Run the full build for [client]"
- "Take this to a site"
- "Go from mockup to build"

This is a compatibility router to `factory-operators.md`. Load only the relevant phase contract; do not use the older local-generation chain for a complete supplied export pack.

This skill belongs to **Sorted Sites** and client website production. Do not use it to restructure the flagship Sorted brand site or the Sorted Ops product site unless the user is explicitly asking to build a website mockup through the manufacturing chain.

---

## Client workspace handoff

For the client-facing hub, follow `operators/skills/start-build.md` → **Client workspace standard: acquisition hub v2**. Use the existing shared workspace with Overview, immersive website, complete standalone ads, full follow-up previews, labelled example tracking and booking-led Next Steps. Configure client data in `lib/workspace.ts`; preserve Stage 1 local-only and CMS approval boundaries.

## Before starting

Confirm you have:
- [ ] Mockup image (`.jpg`, `.png`, or `.webp`)
- [ ] Client slug (short name, lowercase, hyphenated — e.g. `raffles`, `bodysharp`)
- [ ] Complete export pack with design-IR/asset manifests and supplied originals
- [ ] New sibling output directory (`../<client-slug>/`) or existing job to resume

Reuse supplied reconstructed assets. Material missing/conflicting inputs need resolution; regeneration is not the default remedy.

---

## Execution sequence

### Default - Supplied Pack

Read `operators/skills/factory-operators.md`. Use `start-build.sh <slug> <pack-dir>` for a new site and factory `resume` for an existing job. Intake validates/preserves originals; `register-assets` produces the registry without model calls.

Read the approved image and design-IR together, implement the homepage/review routes, and run current-revision structural and independent visual QA. Corrections return to fresh checks. Preserve systemisation, design extraction and core QA.

Human assessment remains separate. Workspace work consumes the human-approved commercial/creative brief in `workspace-build.md`. Internal pages, CMS/CMS QA, analytics, launch and deployment remain approval-gated lifecycle stages.

### Dormant - Missing Input Fallback

Only an explicit missing/replacement-input request activates `mockup-deconstructor.md` or `asset-generator.md`, with required API/network permission. The older frontend API CLI is not the default build path.

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
- [ ] All sections present in approved mockup order; generic page patterns do not override it
- [ ] All assets resolved — no broken image paths in the generated components
- [ ] Copy is real — no lorem ipsum, no placeholder text
- [ ] Phone / email / address placed correctly in the contact section and footer
- [ ] Mobile-safe — no horizontal scroll at 375px viewport
- [ ] Primary CTA is obvious within 5 seconds
- [ ] Advertised internal-page links resolve to real routes using the shared direction-confirmation page until client approval; legal/utility and genuine conversion actions remain functional.

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
  Cost: actual billed / separately estimated / unknown
  Independent visual QA: passed | blocked, current evidence path
  Human approval: approved | pending, separately recorded

Notable decisions:
  - <any design or copy decision made>

Premium upgrade opportunities:
  - <any sections that would benefit from premium treatment>
```

---

## Doctrine references

- `doctrine/sorted-operating-model.md` — Four Nods, the manufacturing model
- `doctrine/operator-chain.md` — state contract, artifact schemas, chain map
- `operators/skills/factory-operators.md` - canonical execution/evidence contracts
- `operators/skills/workspace-build.md` - approved workspace handoff
- `operators/skills/frontend-builder.md` - client reconstruction constraints
