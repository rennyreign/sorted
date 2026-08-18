# Image Optimization Doctrine

Every Sorted client site ships with images that are fully optimized for size and speed without sacrificing visual quality. This is a non-negotiable part of the build standard.

---

## Principle

Images are the heaviest assets on most client sites. Unoptimized images slow page loads, hurt Core Web Vitals, waste bandwidth, and erode the polished feel of an otherwise well-built site.

The goal is simple: **every image is as small as it can be while looking identical to what the client approved.**

---

## What "optimized" means

1. **Right format** — photographic images are WebP, not PNG or JPG. PNG is reserved for assets requiring transparency. SVG for logos and icons.
2. **Right dimensions** — no image is larger than its largest display size × 2 for retina. A 300px display image does not need a 1000px source file.
3. **Right compression** — quality 80-85 for photographic WebP, compression level 8-9 for PNG. Visually lossless, not mathematically lossless.
4. **No orphans** — images not referenced in the codebase are removed before launch. Dead assets bloat the repo and deploy bundle.
5. **Next/Image aware** — images use `next/image` with appropriate `width`/`height` props to prevent layout shift. `priority` only on above-the-fold hero images.

---

## When to optimize

| Stage | Action |
|---|---|
| During build | Use appropriately sized source assets. Don't drop 5MB raw photos into `public/`. |
| Before build commit | Run the optimization script. This is the standard pre-commit gate. |
| After client image swaps (Stage 2+) | Re-run optimization. CMS-uploaded images are optimized at the Netlify CDN layer via `imgSrc()`. |

---

## The optimization script

Every client site includes `scripts/optimize-images.mjs` (copied from the Sorted template). It is a zero-config, idempotent Sharp-based script that:

1. Scans `public/images/` (and any additional dirs passed as args)
2. Converts photographic PNGs/JPGs to WebP
3. Resizes any image exceeding its max display dimension × 2
4. Compresses to quality 82 (WebP) / compression 9 (PNG)
5. Removes orphaned images not referenced in `app/` or `lib/`
6. Reports before/after sizes per file and total savings

Run it with:

```bash
node scripts/optimize-images.mjs
```

The script is safe to re-run. It overwrites in place and only processes files that need changes.

---

## Format rules

| Content type | Format | Reason |
|---|---|---|
| Photographs, food, people, scenes | WebP | Best compression for photographic content, supports alpha |
| Small graphics with transparency (<10KB) | PNG | Logos and icons where PNG's lossless compression is efficient |
| Logos, icons, simple shapes | SVG | Infinite scalability, tiny size |
| Animated content | GIF or WebP (animated) | Only if animation is essential |

## Quality settings

| Format | Setting | Value |
|---|---|---|
| WebP (photographic) | quality | 82 |
| WebP (with alpha) | quality | 85 |
| PNG | compressionLevel | 9 |
| JPG (fallback only) | quality | 82, mozjpeg |

## Resize rules

- Max width for hero images: 2400px
- Max width for section/banner images: 1600px
- Max width for card/thumbnail images: 800px
- Never upscale. If source is smaller than target, leave as-is.
- Maintain aspect ratio always.

---

## Netlify Image CDN (runtime layer)

For Stage 2 sites with CMS content, the `lib/image.ts` `imgSrc()` helper routes images through Netlify's Image CDN for on-the-fly resizing. This handles client-uploaded images that bypass the build-time script.

Build-time optimization (this doctrine) handles the initial site assets. Runtime CDN optimization handles ongoing CMS uploads. Both layers are required for a fully optimized site.

---

## Verification

After running the optimization script:

1. `npm run build` must pass clean
2. Visual inspection — open each page and confirm images render identically
3. Total `public/images/` size should be under 1MB for a typical 10-image site
4. No image should exceed 500KB individually (except hero images, max 800KB)
5. Lighthouse image audit should show no "properly size images" warnings

---

## Reference files

- **Workflow:** `.devin/workflows/image-optimization.md`
- **Script (template):** `templates/client-site/scripts/optimize-images.mjs`
- **Runtime helper:** `lib/image.ts` (Stage 2, Netlify Image CDN)
