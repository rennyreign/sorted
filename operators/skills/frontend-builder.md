# Skill: frontend-builder

## Stage 1 Internal-Page Links

Before building or resuming a pre-approval client site, read `operators/skills/stage-1-direction-confirmation.md` (from the Sorted repo root). Implement its shared direction-confirmation pages and consistent internal routes during Op 4, before Op 5/5b. This is an intentional review state, not a finished internal page or client approval.


**Type:** Step skill — Chain Step 3 of 3  
**Trigger:** Loaded by `site-build` skill, or directly when user asks to build the frontend  
**Execution:** Active coding harness; older API CLI is a dormant legacy fallback  
**Input:** Approved mockup + supplied design-IR + validated asset registry + client facts/unknowns  
**Output:** Complete Next.js client site repo, `npm run build` passing

---

## What this step does

The default path follows `factory-operators.md` and builds a ready-to-review Next.js site from the ChatGPT export pack. Preserve originals and source precedence; do not repeat local deconstruction/generation. The older API implementation remains a fallback and is not a fidelity-certified scale solution.

The legacy implementation:

1. Scaffolds the repo from `templates/client-site/`
2. Copies all asset WebP variants into `public/assets/`
3. Populates `client/brief.md` from the deconstruction data
4. Generates each file (globals.css, layout.tsx, Nav, sections, Footer, page.tsx) as a separate Claude call
5. Runs verification only when requested; dependency installation requires explicit opt-in/permission

**Critical principle:** The agent writes the code directly, section by section, reading the mockup image and the deconstruction JSON together. Claude is used for boilerplate and initial structure — the agent reviews and corrects the output before accepting it.

---

## Execution

### Orchestration agent path (standard — preferred)

Use the coding harness's normal implementation/review workflow. Load the approved mockup alongside supplied design-IR, client facts and resolved assets. Build section by section against their composition, copy and proportions. Do not force the lead to personally write every file when bounded implementation delegation is available.

This produces higher-fidelity output than delegating entirely to Claude, because:
- The mockup image contains layout information (proportions, spacing, image positions) that the JSON does not fully capture
- The agent can make real-time decisions about what looks right vs what is generic
- Iteration is faster than a full Claude regeneration cycle

**Section-by-section approach:**
1. `app/globals.css` — brand tokens, keyframes, utility classes
2. `app/layout.tsx` — metadata, Viewport export, font setup
3. `components/Nav.tsx` — logo treatment, links, phone, CTA button
4. `components/sections/Hero1.tsx` — full-bleed, exact headline treatment from mockup
5. `components/sections/*.tsx` — one file per section, visual fidelity to mockup
6. `components/Footer.tsx` - the approved client's structure, verified destinations and legal/review states
7. `app/page.tsx` — clean assembler, imports all sections

**Dormant legacy CLI, only when explicitly selected:** Never aim it at an existing repo. No-build/dry-run is not verification, and API/network/install permission remains separate.
```bash
cd operators/frontend-builder/implementation
node dist/cli.js \
  <deconstruction.json> \
  <manifest.json> \
  <assets-dir> \
  --slug <slug> \
  --output ./output/<slug>-site \
  --verbose
```

Then open the dev server and compare against the mockup visually. Fix any sections that are structurally off.

### Operator pipeline path (scale)

The Node.js implementation is a legacy text-context generation path. Do not describe it as proven higher-throughput manufacturing until paired tests establish accepted fidelity, reliability and total rework cost.

---

## Output path convention

```
operators/frontend-builder/implementation/output/<slug>-site/
```

Or any path specified via `--output`.

---

## Stack constraints — apply always

These are non-negotiable in every generated component:

- **TailwindCSS v4** — no `@apply border-border`, no `@apply bg-background`, no v3 CSS variable utilities
- **`<img>` tags** — not `next/image` (static export + unoptimized mode)
- **lucide-react only** — no other icon libraries
- **No new npm packages** — work within what `package.json` already has
- **Server Components by default** — only `"use client"` when genuinely needed (useState, event handlers)
- **`Viewport` export** — `themeColor` goes in `export const viewport: Viewport`, not in `metadata`
- **Real copy** — no lorem ipsum or generic "Coming soon" pages. The explicit Stage 1 direction-confirmation state in `stage-1-direction-confirmation.md` is permitted until the client confirms the homepage direction.

---

## Design fidelity checklist

For each section, verify against the mockup:

- [ ] Background treatment matches (full-bleed image, flat colour, light/dark)
- [ ] Headline typography matches — size, weight, tracking, line height
- [ ] Gold/accent colour applied correctly — on eyebrows, rules, CTAs, highlights
- [ ] Image layout matches — image position, aspect ratio, fill behaviour
- [ ] Card structure matches — border presence/absence, padding, spacing
- [ ] CTA style matches — filled vs outlined, size, tracking

Approved human amendments override the original design. The mockup governs composition; verified facts govern claims; design-IR supplies detail/copy/IDs unless conflicting. Stop for material conflicts. Use available client font files and verify rendered faces/weights; generic typography/spacing defaults do not override the image.

---

## TailwindCSS v4 patterns

Use these — not v3 equivalents:

```css
/* Theme tokens — in globals.css */
@theme {
  --color-accent: #C89B53;
  --font-sans: "Plus Jakarta Sans", system-ui, sans-serif;
}

/* Border reset — NOT @apply border-border */
@layer base {
  * { border-color: rgb(255 255 255 / 0.08); }
}

/* CSS variable in class — correct v4 syntax */
bg-[--color-accent]          /* or */
text-[#C89B53]                /* direct value always safe */
```

---

## Build verification

After writing all files:

```bash
cd output/<slug>-site
npm run build
```

Expected output:
```
✓ Compiled successfully
✓ Generating static pages (n/n)
Route (app)
  ○ /   (Static)
```

**Zero errors. Zero warnings.** Fix anything that produces a warning — they often indicate a runtime issue that will surface in the browser.

---

## Common failure modes

| Failure | Cause | Fix |
|---|---|---|
| `border-border` CSS error | TailwindCSS v3 pattern in globals | Replace with `border-color: rgb(...)` directly in `@layer base` |
| `themeColor` metadata warning | Should be in `viewport` export | Move to `export const viewport: Viewport = { themeColor: '...' }` |
| `from-[var(--color-primary)]` CSS error | Corrupted variable name from generation | Replace with hardcoded hex value |
| Image 404 | Asset path mismatch | Check asset ID in manifest vs path used in component |
| TypeScript error on `whitespace-pre-line` | Not an error — ignore TS warnings on Tailwind classes | Run build to confirm it compiles |

---

## After the build passes

1. Start the dev server: `npm run dev --port 3099`
2. Open in browser and compare each section against the mockup
3. Fix any visual discrepancies — particularly hero layout, card structures, section spacing
4. Report Standard vs Premium tier, notable decisions, Premium upgrade opportunities

---

## Doctrine references

- `doctrine/operator-chain.md` — Artifact 3 schema, chain map
- `templates/client-site/AGENTS.md` — full build brief for the output repo
- `doctrine/sorted-operating-model.md` — Stage 1 build rules, what not to include
