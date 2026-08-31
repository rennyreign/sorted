# Skill: op-04-frontend-build

**Operator:** 4 — Frontend Reconstruction
**Execution:** harness
**Trigger:** `frontend-build` is the next pending operator
**Input:** `input/approved-mockup.png` + `artifacts/deconstruction.json` + `artifacts/asset-registry.json`
**Output:** `artifacts/frontend-build.json` + the site repo

---

## What you do

Recreate the approved mockup as functioning frontend code. The mockup is the primary source of truth. You write the code directly — section by section — reading the mockup image alongside the deconstruction JSON and asset registry.

**Critical principle:** You write the code yourself. You do not delegate to an external code generation API. You have the mockup, the deconstruction, and the assets. Write the TSX directly.

## How to execute

### Step 1: Scaffold the repo

Scaffold from the existing template at `templates/client-site/` (or create a fresh Next.js project if no template exists). The output goes to the build directory's site folder.

```
<build-dir>/site/
  app/
    globals.css
    layout.tsx
    page.tsx
  components/
    Nav.tsx
    Footer.tsx
    sections/
      <Section>.tsx
  public/
    images/        (copy assets here per the registry)
  client/
    brief.md
  package.json
  next.config.mjs
  tsconfig.json
```

### Step 2: Copy assets

Copy all registered assets from `artifacts/assets-raw/` into `site/public/images/` following the production paths from `asset-registry.json`.

### Step 3: Write globals.css

Read the mockup visually. Extract:
- Brand colour tokens (from `deconstruction.json` build_notes.accent_color, theme)
- Font stack (from build_notes.primary_font, secondary_font)
- Keyframes for any animations
- Utility classes

Use TailwindCSS v4 `@theme` syntax:

```css
@theme {
  --color-accent: #C89B53;
  --font-sans: "Plus Jakarta Sans", system-ui, sans-serif;
}
```

### Step 4: Write layout.tsx

Metadata, Viewport export, font setup. Follow the existing frontend-builder conventions.

### Step 5: Write Nav.tsx

Read the mockup's header/nav area. Reproduce logo treatment, links, phone, CTA button.

### Step 6: Write each section

For each section in the deconstruction (in position order):
1. Read that section's region from the mockup image
2. Read the copy from `deconstruction.json`
3. Read the asset references from `asset-registry.json`
4. Write the TSX component file

Reproduce exactly:
- Background treatment (full-bleed image, flat colour, light/dark)
- Headline typography (size, weight, tracking, line height)
- Accent colour application (eyebrows, rules, CTAs, highlights)
- Image layout (position, aspect ratio, fill behaviour)
- Card structure (border, padding, spacing)
- CTA style (filled vs outlined, size, tracking)
- Spacing and proportions

### Step 7: Write Footer.tsx

Read the mockup's footer. Reproduce 4-column layout, social icons, legal links.

### Step 8: Write page.tsx

Clean assembler that imports all sections in order.

### Step 9: Build verification

```bash
cd <build-dir>/site
npm install
npm run build
```

**Zero errors. Zero warnings.** Fix anything that produces a warning.

### Step 10: Write frontend-build.json

```json
{
  "site_repo_path": "<path to site repo>",
  "build_passed": true,
  "sections_generated": ["hero", "services", "story", "cta", "footer"],
  "assets_resolved": 12,
  "assets_total": 12,
  "generated_at": "<ISO timestamp>"
}
```

### Step 11: Mark passed

Mark `frontend-build` as passed in build state.

## Stack constraints — apply always

- **TailwindCSS v4** — no `@apply border-border`, no v3 CSS variable utilities
- **`<img>` tags** — not `next/image` (static export + unoptimized mode)
- **lucide-react only** — no other icon libraries
- **No new npm packages** — work within what the template has
- **Server Components by default** — only `"use client"` when genuinely needed
- **`Viewport` export** — `themeColor` goes in `export const viewport: Viewport`
- **Real copy** — no lorem ipsum, no placeholder text

## Validation

- `npm run build` passes with zero errors and zero warnings
- All sections from the deconstruction are present
- All assets resolve (no 404s)
- No lorem ipsum or placeholder text
- Mobile-safe (no horizontal scroll at 375px)

## Failure states

- Build fails → fix TypeScript/CSS errors, rebuild
- Asset 404 → check asset-registry paths vs actual file locations
- Section missing → check deconstruction sections array

## Doctrine references

- `operators/skills/frontend-builder.md` — detailed frontend build conventions
- `templates/client-site/AGENTS.md` — full build brief for the output repo
