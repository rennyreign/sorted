---
description: Optimize all images in a Sorted client site before build commit
---

# Image Optimization Workflow

Run this before committing the final Stage 1 build, and again whenever new images are added to `public/`.

**Doctrine:** `doctrine/image-optimization.md`

---

## Step 1 — Copy the script (if not present)

If the client repo doesn't have `scripts/optimize-images.mjs`, copy it from the Sorted template:

```bash
cp ~/Projects/sorted/templates/client-site/scripts/optimize-images.mjs ./scripts/optimize-images.mjs
```

Ensure `sharp` is installed (it's in the template's `devDependencies`):

```bash
npm install --save-dev sharp
```

---

## Step 2 — Run the optimization

```bash
node scripts/optimize-images.mjs
```

The script will:
1. Inventory all images in `public/images/`
2. Check each against code references in `app/`, `components/`, `lib/`
3. Convert photographic PNGs/JPGs → WebP
4. Resize oversized images to max display dimension × 2
5. Compress to quality 82 (WebP) / compression 9 (PNG)
6. Remove orphaned images (not referenced anywhere in code)
7. Print a before/after report

Review the output. Pay attention to:
- **Orphaned images removed** — confirm these weren't referenced via dynamic strings
- **Large savings** — confirm the visual quality of any image that shrank by >70%
- **Errors** — any file that failed to process

---

## Step 3 — Update code references

If any images were converted from `.png`/`.jpg` to `.webp`, update the `src` props in the codebase:

```bash
# Find all image references
grep -rn '/images/' app/ components/ lib/
```

Replace `.png` and `.jpg` extensions with `.webp` for photographic images. Keep `.png` for transparent logos/graphics.

> The script prints a list of renamed files to make this easier.

---

## Step 4 — Visual verification

1. Run `npm run dev`
2. Visit every page that displays images
3. Confirm each image renders correctly — no visible quality loss, no broken src
4. Check mobile and desktop viewports

---

## Step 5 — Build verification

```bash
npm run build
```

Must pass clean with zero errors.

---

## Step 6 — Commit

```bash
git add -A
git commit -m "perf: optimize all images for size and speed"
```

---

## When to re-run

- After adding new images to `public/`
- After client supplies replacement assets
- Before any production merge
- After CMS image swaps (though these are handled by Netlify CDN at runtime)

The script is idempotent — safe to run repeatedly.
