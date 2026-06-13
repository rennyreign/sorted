# Skill: frontend-builder

**Type:** Step skill — Chain Step 3 of 3  
**Trigger:** Loaded by `site-build` skill, or directly when user asks to build the frontend  
**External API:** Claude (code generation) — `claude-sonnet-4-5` by default  
**Input:** `deconstruction.json` + `manifest.json` + `assets/`  
**Output:** Complete Next.js client site repo, `npm run build` passing

---

## What this step does

Takes the structured deconstruction and asset manifest and produces a complete, ready-to-review Next.js site. It:

1. Scaffolds the repo from `templates/client-site/`
2. Copies all asset WebP variants into `public/assets/`
3. Populates `client/brief.md` from the deconstruction data
4. Generates each file (globals.css, layout.tsx, Nav, sections, Footer, page.tsx) as a separate Claude call
5. Runs `npm install` + `npm run build` to verify the output

**Critical principle:** The agent writes the code directly, section by section, reading the mockup image and the deconstruction JSON together. Claude is used for boilerplate and initial structure — the agent reviews and corrects the output before accepting it.

---

## Execution

### Orchestration agent path (standard — preferred)

**Write the code directly.** Load the mockup image alongside the deconstruction JSON. For each section, write the TSX by hand — referencing the mockup visually and the deconstruction JSON for copy, assets, and structure.

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
6. `components/Footer.tsx` — 4-column, social icons, legal links
7. `app/page.tsx` — clean assembler, imports all sections

**Or use the operator CLI for initial generation, then review and correct:**
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

The Node.js operator at `operators/frontend-builder/implementation/` runs the full generation via Claude. Suitable for automated pipelines where human visual review happens after the fact.

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
- **Real copy** — no lorem ipsum, no placeholder text, no "Coming soon"

---

## Design fidelity checklist

For each section, verify against the mockup:

- [ ] Background treatment matches (full-bleed image, flat colour, light/dark)
- [ ] Headline typography matches — size, weight, tracking, line height
- [ ] Gold/accent colour applied correctly — on eyebrows, rules, CTAs, highlights
- [ ] Image layout matches — image position, aspect ratio, fill behaviour
- [ ] Card structure matches — border presence/absence, padding, spacing
- [ ] CTA style matches — filled vs outlined, size, tracking

The mockup is the source of truth for layout. The deconstruction JSON is the source of truth for copy and asset IDs.

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
