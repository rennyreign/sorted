# Skill: op-03-asset-registry

**Operator:** 3 — Asset Registry
**Execution:** standalone (post-processes Operator 2 output)
**Trigger:** `asset-registry` is the next pending operator
**Input:** `artifacts/assets-raw/` (from Operator 2) + `artifacts/deconstruction.json`
**Output:** `artifacts/asset-registry.json`

---

## What this operator does

Turns raw generated images into deterministic website assets. Validates files, applies naming conventions, optimises (WebP, responsive variants), stores in project asset locations, and maps manifest IDs → production paths.

This is deterministic post-processing — no model calls needed. The asset generator CLI already produces size variants; this operator creates the registry that the frontend builder consumes.

## How to execute

### Step 1: Read the asset generator manifest

Read `artifacts/assets-raw/manifest.json` to get the list of generated assets, their file paths, and status.

### Step 2: Build the registry

For each asset with status `ok`, create a registry entry:

```json
{
  "asset_id": "hero_primary",
  "production_path": "/images/home/hero-primary.webp",
  "file_path": "<absolute path to the file in the site repo>",
  "format": "webp",
  "variants": {
    "original": "assets/hero_primary/original.webp",
    "lg": "assets/hero_primary/lg.webp",
    "md": "assets/hero_primary/md.webp",
    "sm": "assets/hero_primary/sm.webp",
    "xs": "assets/hero_primary/xs.webp"
  },
  "width": 1920,
  "height": 1080,
  "aspect_ratio": "16:9",
  "source_model": "gpt-image-1",
  "ai_placeholder_human": false
}
```

### Step 3: Apply naming convention

Convert asset IDs to production paths:
- `hero_primary` → `/images/home/hero-primary.webp`
- `story_restaurant` → `/images/home/story-restaurant.webp`
- `service_image_01` → `/images/home/service-01.webp`

Use the section from the deconstruction to determine the subdirectory:
- Homepage assets → `/images/home/`
- About page assets → `/images/about/`
- etc.

### Step 4: Write the registry

Write `artifacts/asset-registry.json`:

```json
{
  "generated_at": "<ISO timestamp>",
  "assets": [ ...registry entries... ]
}
```

### Step 5: Mark passed

Mark `asset-registry` as passed in build state.

## Validation

- `asset-registry.json` exists and is valid JSON
- Every `ok` asset from the generator manifest has a registry entry
- Every registry entry's file_path points to a file that exists on disk
- Production paths follow the naming convention

## Failure states

- Asset files missing from disk → check if Operator 2 actually completed
- Manifest is invalid → re-run Operator 2
- Naming convention conflict → append suffix to resolve

## Notes

The frontend builder (Operator 4) consumes this registry rather than guessing filenames. This is the contract between asset generation and frontend construction.
