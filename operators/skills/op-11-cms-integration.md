# Skill: op-11-cms-integration

**Operator:** 11 — CMS Integration
**Execution:** harness
**Trigger:** `cms-integration` is the next pending operator (after internal-pages pass)
**Input:** the site repo (core build signed off)
**Output:** `artifacts/cms-integration.json`

---

## What you do

Apply SortedUpdates CMS to the approved website. This occurs **after the underlying website has passed its core build gate**.

Follow the existing CMS doctrine and skill:
- Primary doctrine: `doctrine/sorted-studio-cms.md`
- Installation skill: `operators/skills/sorted-studio-cms.md`
- Reference implementation: `warwickshire-str` — study `public/cms/`, `lib/content.ts`, `content/` before starting

## How to execute

### Step 1: Load the CMS doctrine

Read `operators/skills/sorted-studio-cms.md` in full. This is the canonical specification.

### Step 2: Identify customer-editable content

Read through the site's content. Identify what the customer should be able to edit:
- Headlines and body copy
- Contact information (phone, email, address)
- Service/pricing details
- Images (hero, gallery, team photos)
- Testimonials
- Business hours
- Special offers / announcements

### Step 3: Map content to CMS fields

For each editable content item, define:
- Field name
- Field type (text, textarea, image, list, color, number, property-list)
- Content path (where in the site it maps)
- Section grouping

### Step 4: Install the CMS files

Create the required files per the doctrine:
- `public/cms/index.html` — Studio shell
- `public/cms/decap.html` — Decap fallback
- `public/cms/studio.css` — Studio design system
- `public/cms/studio.js` — Studio adapter
- `public/cms/studio-manifest.json` — page/section/field map
- `public/cms/studio-content.json` — generated snapshot
- `public/cms/config.yml` — Decap backend config
- `scripts/build-studio-content.mjs` — snapshot generator
- `lib/content.ts` — TypeScript types and loaders

### Step 5: Configure authentication

- Local mode: proxy to local content files
- Production mode: Git Gateway with Netlify Identity

### Step 6: Establish baseline

- Commit the current state as the CMS baseline
- Ensure reset script works
- Record the baseline commit

### Step 7: Build verification

```bash
cd <build-dir>/site
npm run build
```

Build must still pass with CMS files in place.

### Step 8: Write cms-integration.json

```json
{
  "cms_path": "/cms/",
  "field_mappings": [
    { "field_name": "hero_headline", "field_type": "text", "content_path": "components/sections/Hero.tsx", "section": "hero" },
    { "field_name": "hero_image", "field_type": "image", "content_path": "components/sections/Hero.tsx", "section": "hero" },
    { "field_name": "services", "field_type": "list", "content_path": "components/sections/Services.tsx", "section": "services" }
  ],
  "auth_configured": true,
  "baseline_committed": true,
  "integrated_at": "<ISO timestamp>"
}
```

### Step 9: Mark passed

Mark `cms-integration` as passed in build state.

## Validation

- `cms-integration.json` exists and is valid JSON
- All required CMS files exist in the site repo
- `npm run build` passes
- Studio manifest covers all editable content
- Auth is configured for production

## Failure states

- Build breaks after CMS install → check for import/path errors, fix
- Studio manifest doesn't match site content → regenerate
- Auth configuration fails → check Netlify Identity settings

## Critical rule

The CMS is ownership infrastructure. It must not become a reason to destabilise the approved website. If CMS integration breaks the build, fix it before proceeding.
